"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { simulateCheckoutOutcome } from "@/lib/api/mock/payments";
import { formatNaira } from "@/lib/format";
import type { PaymentInitialization } from "@/types/payment";

/**
 * MOCK ONLY: a stand-in for Paystack Checkout so the payment flow can be
 * demoed end to end. It never decides whether a payment succeeded. It just
 * tells the (mock) backend what the "customer" did, and the app then asks the
 * backend for the result exactly as it will with real Paystack.
 *
 * Delete this file when Paystack is connected.
 */
export function MockCheckoutSheet({
  init,
  onFinished,
}: {
  init: PaymentInitialization;
  onFinished: (reference: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const done = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function finish(outcome: "SUCCESS" | "FAILED" | "ABANDONED") {
    if (done.current) return;
    done.current = true;
    simulateCheckoutOutcome(init.reference, outcome);
    setOpen(false);
    // Let the sheet slide away before the screen behind it changes.
    timer.current = setTimeout(() => onFinished(init.reference), 220);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && finish("ABANDONED")}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-md rounded-t-3xl p-5 pb-8"
      >
        <SheetHeader className="p-0">
          <p className="w-fit rounded-full bg-warning-soft px-2.5 py-0.5 text-[0.7rem] font-bold tracking-wide text-warning-foreground uppercase">
            Demo checkout
          </p>
          <SheetTitle className="font-heading text-xl">
            Pay {formatNaira(init.amount)}
          </SheetTitle>
          <SheetDescription>
            This stands in for Paystack. Pick what happens next to try each
            outcome.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-2">
          <Button size="lg" onClick={() => finish("SUCCESS")}>
            Simulate successful payment
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => finish("FAILED")}
          >
            Simulate failed payment
          </Button>
          <Button size="lg" variant="ghost" onClick={() => finish("ABANDONED")}>
            Close without paying
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
