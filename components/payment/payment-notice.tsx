"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/registration";

const COPY = {
  PENDING: {
    title: "Payment Pending",
    body: "Your registration has been created. Complete payment to activate your event access.",
    icon: Clock,
    style: "border-warning/30 bg-warning-soft text-warning-foreground",
  },
  PAID: {
    title: "Payment Confirmed",
    body: "Your payment has been confirmed. Your QR code is ready for event entry.",
    icon: CircleCheck,
    style: "border-success/25 bg-success-soft text-success",
  },
} as const;

/** Plain-language explanation of what the current payment status means. */
export function PaymentNotice({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const copy = COPY[status];
  const Icon = copy.icon;
  return (
    <div className={className} role="status" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={status}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4",
            copy.style,
          )}
        >
          <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">{copy.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">
              {copy.body}
            </p>
          </div>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
