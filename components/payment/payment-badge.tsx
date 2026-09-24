"use client";

import { AnimatePresence, m } from "motion/react";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/registration";

const STYLES: Record<PaymentStatus, string> = {
  PAID: "bg-success-soft text-success",
  PENDING: "bg-warning-soft text-warning-foreground",
};

/** Pill showing PAID / PENDING. It flips when the status changes. */
export function PaymentBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={status}
          initial={{ opacity: 0, scale: 0.8, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -6 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide",
            STYLES[status],
          )}
        >
          {status === "PAID" ? (
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
          ) : (
            <Clock className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
          )}
          {status}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
