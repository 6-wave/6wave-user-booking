import { ShieldCheck } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { DetailList, DetailRow } from "@/components/registration/detail-list";
import { PurchaseBadge } from "@/components/registration/purchase-badge";
import { getOption } from "@/lib/event";
import type { Registration } from "@/types/registration";

/**
 * Presentational only: what the participant is about to pay for. Shows the
 * advertised price of their ticket; the backend decides the real amount when
 * checkout starts.
 */
export function PaymentSummary({ registration }: { registration: Registration }) {
  const feeNaira = getOption(registration.optionId).priceNaira;
  return (
    <div className="card-pop rounded-3xl p-5">
      <DetailList>
        <DetailRow label="Purchase">
          <PurchaseBadge optionId={registration.optionId} />
        </DetailRow>
        <DetailRow label="Price">{formatNaira(feeNaira)}</DetailRow>
        <DetailRow label="Registration">
          <span className="block">{registration.displayName}</span>
          <span className="block font-mono text-xs font-medium text-muted-foreground">
            {registration.reference}
          </span>
        </DetailRow>
      </DetailList>

      <div className="mt-4 flex items-baseline justify-between gap-4 rounded-2xl bg-secondary px-4 py-4">
        <span className="text-sm font-medium text-secondary-foreground">
          Amount to pay
        </span>
        <span className="font-heading text-3xl font-extrabold tracking-tight">
          {formatNaira(feeNaira)}
        </span>
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-success"
          aria-hidden="true"
        />
        No extra charges. The price you see is the price you pay.
      </p>
    </div>
  );
}
