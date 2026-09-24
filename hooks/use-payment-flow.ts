"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { getPaymentStatus, initializePayment } from "@/lib/api/payments";
import { sleep } from "@/lib/sleep";
import type { PaymentFlowState } from "@/types/payment";

const POLL_INTERVAL_MS = 1500;
/** After this many checks we tell the user it's taking longer than usual. */
const SLOW_AFTER_ATTEMPTS = 6;

interface Options {
  registrationId: string;
  /** Present when the user returns from a hosted checkout redirect. */
  initialReference?: string;
  /** Called once the backend confirms the payment, so the caller can refetch. */
  onPaid?: () => void;
}

/**
 * State machine for the pay screen. Success is only ever set from what the
 * backend reports via getPaymentStatus, never from a click or a callback.
 *
 * idle → initializing → checkout → verifying → success | failed | cancelled
 *                ↘ error
 */
export function usePaymentFlow({
  registrationId,
  initialReference,
  onPaid,
}: Options) {
  const [state, setState] = useState<PaymentFlowState>(
    initialReference
      ? { phase: "verifying", reference: initialReference, slow: false }
      : { phase: "idle" },
  );
  // Bumped by "Check again" to restart polling for the same reference.
  const [recheck, setRecheck] = useState(0);

  const onPaidRef = useRef(onPaid);
  useEffect(() => {
    onPaidRef.current = onPaid;
  });

  const verifyingReference =
    state.phase === "verifying" ? state.reference : null;

  // While "verifying", keep asking the backend until the payment settles.
  useEffect(() => {
    if (!verifyingReference) return;
    let cancelled = false;

    async function poll(reference: string) {
      for (let attempt = 1; ; attempt++) {
        try {
          const payment = await getPaymentStatus(reference);
          if (cancelled) return;

          if (payment.status === "SUCCESS") {
            setState({ phase: "success", reference });
            onPaidRef.current?.();
            return;
          }
          if (payment.status === "FAILED") {
            setState({ phase: "failed", reference });
            return;
          }
          if (payment.status === "ABANDONED") {
            setState({ phase: "cancelled", reference });
            return;
          }
        } catch {
          // A hiccup while checking shouldn't look like a failed payment.
          if (cancelled) return;
        }

        if (attempt === SLOW_AFTER_ATTEMPTS) {
          setState({ phase: "verifying", reference, slow: true });
          return;
        }
        await sleep(POLL_INTERVAL_MS);
        if (cancelled) return;
      }
    }

    void poll(verifyingReference);
    return () => {
      cancelled = true;
    };
  }, [verifyingReference, recheck]);

  const start = useCallback(async () => {
    setState({ phase: "initializing" });
    try {
      const init = await initializePayment(registrationId);
      setState({ phase: "checkout", init });
    } catch (error) {
      setState({ phase: "error", message: errorMessage(error) });
    }
  }, [registrationId]);

  /** Checkout finished or was closed. Either way, ask the backend what happened. */
  const finishCheckout = useCallback((reference: string) => {
    setState({ phase: "verifying", reference, slow: false });
  }, []);

  /** Manual re-check after the "taking longer than usual" message. */
  const checkAgain = useCallback(() => {
    setState((current) =>
      current.phase === "verifying"
        ? { phase: "verifying", reference: current.reference, slow: false }
        : current,
    );
    setRecheck((n) => n + 1);
  }, []);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, start, finishCheckout, checkAgain, reset };
}
