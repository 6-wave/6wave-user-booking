"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT, getCurrentWave, getOption } from "@/lib/event";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Registration } from "@/types/registration";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the value is on screen to copy by hand.
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? <Check className="text-success" /> : <Copy />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function Detail({ label, value, copy, mono }: { label: string; value: string; copy?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("font-semibold break-words", mono && "font-mono text-lg tracking-wide")}>{value}</p>
      </div>
      {copy ? <CopyButton value={copy} label={label.toLowerCase()} /> : null}
    </div>
  );
}

/** Pay by bank transfer, then send the receipt on WhatsApp. Staff mark it paid. */
export function BankTransferSteps({ registration }: { registration: Registration }) {
  const { bank, accountNumber, accountName, whatsapp } = EVENT.payment;
  const option = getOption(registration.optionId);
  const wave = getCurrentWave();
  const amount = formatNaira(option.priceNaira);

  const message =
    `Hi, I'm ${registration.displayName}, ref ${registration.reference}, ` +
    `paid ${amount} (${option.label}).`;
  const whatsappLink = `https://wa.me/${whatsapp.waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="space-y-5">
      <div className="card-pop rounded-3xl p-5">
        <p className="text-sm font-medium text-muted-foreground">Amount to pay</p>
        <p className="mt-1 text-4xl font-bold">{amount}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {option.label} · {wave.label} price
          {wave.endsLabel
            ? `. Pay by ${wave.endsLabel} to keep it. After that, the next wave's price applies.`
            : "."}
        </p>

        <div className="mt-4 divide-y rounded-2xl border px-4">
          <Detail label="Bank" value={bank} />
          <Detail label="Account number" value={accountNumber} copy={accountNumber} mono />
          <Detail label="Account name" value={accountName} />
          <Detail label="Narration" value={registration.reference} copy={registration.reference} mono />
        </div>
      </div>

      <ol className="card-pop space-y-3 rounded-3xl p-5">
        {[
          `Transfer ${amount} to the account above. Put ${registration.reference} as the narration.`,
          "Take a screenshot of the receipt.",
          `Send it on WhatsApp to ${whatsapp.display}. The button below fills in your details.`,
          "We confirm your payment and mark you as paid. Your QR code stays the same.",
        ].map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <Button asChild size="lg" className="w-full">
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle /> Send receipt on WhatsApp
        </a>
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Check the account name before you send. We&apos;ll never ask you to pay to a different account.
      </p>
    </div>
  );
}
