import { Clock } from "lucide-react";

export function PaymentComingSoon() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-4 text-warning-foreground">
      <Clock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">Online payment is coming soon</p>
        <p className="mt-0.5 text-sm leading-relaxed text-foreground/75">
          We&apos;re still setting up online payment. Your registration and QR
          code are already confirmed — you can pay at the gate on the night,
          by cash or card. Your QR code stays the same either way.
        </p>
      </div>
    </div>
  );
}
