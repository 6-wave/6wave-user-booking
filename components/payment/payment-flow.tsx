"use client";

import Link from "next/link";
import { AnimatePresence, m } from "motion/react";
import { Check, Lock } from "lucide-react";
import { Burst } from "@/components/feedback/burst";
import { RippleLoader } from "@/components/feedback/ripple-loader";
import { Spinner } from "@/components/feedback/spinner";
import { StatusMark } from "@/components/feedback/status-mark";
import { Swap } from "@/components/feedback/swap";
import {
  ErrorCard,
  LoadingCard,
  NotFoundCard,
} from "@/components/registration/resource-states";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { useRegistration } from "@/hooks/use-registration";
import { usePaymentFlow } from "@/hooks/use-payment-flow";
import { EVENT } from "@/lib/event";
import { formatNaira } from "@/lib/format";
import { CheckoutSurface } from "./checkout-surface";
import { PaymentSummary } from "./payment-summary";

const view = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25 },
};

function ResultCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center card-pop rounded-3xl p-6 text-center ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/**
 * The whole pay screen. It decides which view to show from the backend's
 * registration status and the payment flow state, and contains no payment
 * logic itself (see hooks/use-payment-flow and components/payment/checkout-surface).
 */
export function PaymentFlow({
  registrationId,
  initialReference,
}: {
  registrationId: string;
  initialReference?: string;
}) {
  const registration = useRegistration(registrationId);
  const flow = usePaymentFlow({
    registrationId,
    initialReference,
    onPaid: registration.refresh,
  });

  if (registration.state.status === "loading") return <LoadingCard />;
  if (registration.state.status === "not-found") return <NotFoundCard />;
  if (registration.state.status === "error")
    return (
      <ErrorCard
        message={registration.state.message}
        onRetry={registration.retry}
      />
    );

  const data = registration.state.data;
  const { state } = flow;
  const viewingRegistration = (
    <Button asChild variant="outline" size="lg" className="w-full">
      <Link href={`/registration/${data.id}`}>View registration</Link>
    </Button>
  );

  // The backend's word wins: if it says PAID, that's what we show.
  const paid = data.paymentStatus === "PAID" || state.phase === "success";

  let content: React.ReactNode;
  let key: string;

  if (data.status === "CANCELLED") {
    key = "cancelled-registration";
    content = (
      <ResultCard>
        <StatusMark tone="cancelled" />
        <h2 className="mt-4 text-2xl font-bold">Registration cancelled</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This registration can&apos;t be paid for. Please contact the
          organizers if you think this is a mistake.
        </p>
      </ResultCard>
    );
  } else if (paid) {
    key = "paid";
    content = (
      <ResultCard>
        <div className="relative">
          <StatusMark tone="success" />
          {state.phase === "success" ? <Burst /> : null}
        </div>
        <h2 className="mt-4 text-2xl font-bold">Payment Confirmed</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your payment has been confirmed. Your QR code is ready for event
          entry.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          It&apos;s the same QR code you already have, so there&apos;s nothing
          new to download.
        </p>
        <Button asChild size="lg" className="mt-6 w-full">
          <Link href={`/registration/${data.id}`}>View my QR code</Link>
        </Button>
      </ResultCard>
    );
  } else if (state.phase === "verifying") {
    key = "verifying";
    content = (
      <ResultCard>
        <RippleLoader />
        <h2 className="mt-4 text-2xl font-bold">
          {state.slow ? "Still confirming…" : "Confirming your payment…"}
        </h2>
        <p role="status" className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {state.slow
            ? "This is taking longer than usual. Your payment may still be going through, so please don't pay again yet."
            : "Please keep this page open. This usually takes a few seconds."}
        </p>
        {state.slow ? (
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button size="lg" onClick={flow.checkAgain}>
              Check again
            </Button>
            {viewingRegistration}
          </div>
        ) : null}
      </ResultCard>
    );
  } else if (state.phase === "failed" || state.phase === "cancelled") {
    const failed = state.phase === "failed";
    key = state.phase;
    content = (
      <ResultCard>
        <StatusMark tone={failed ? "failed" : "cancelled"} />
        <h2 className="mt-4 text-2xl font-bold">
          {failed ? "Payment failed" : "Payment cancelled"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {failed
            ? `Your payment didn't go through. If you were debited, please contact the organizers with your registration number, ${data.reference}.`
            : "You closed checkout before paying. Your registration and QR code are still safe, and you can pay whenever you're ready."}
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Button size="lg" onClick={flow.reset}>
            Try again
          </Button>
          {viewingRegistration}
        </div>
      </ResultCard>
    );
  } else {
    key = "summary";
    const busy = state.phase === "initializing" || state.phase === "checkout";
    content = (
      <div className="space-y-4">
        <PaymentSummary registration={data} feeNaira={EVENT.feeNaira} />
        <FormError
          title="We couldn't start your payment"
          message={state.phase === "error" ? state.message : null}
        />
        <Button
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={flow.start}
        >
          <Swap id={state.phase === "idle" || state.phase === "error" ? "idle" : state.phase}>
            {state.phase === "initializing" ? (
              <>
                <Spinner /> Preparing checkout…
              </>
            ) : state.phase === "checkout" ? (
              <>
                <Check /> Checkout open
              </>
            ) : (
              <>
                <Lock /> Pay {formatNaira(EVENT.feeNaira)}
              </>
            )}
          </Swap>
        </Button>
        {state.phase === "checkout" ? (
          <CheckoutSurface init={state.init} onFinished={flow.finishCheckout} />
        ) : null}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.div key={key} {...view}>
        {content}
      </m.div>
    </AnimatePresence>
  );
}
