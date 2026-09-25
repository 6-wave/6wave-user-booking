"use client";

import { Armchair, Check, Star, Users } from "lucide-react";
import {
  OPTION_KINDS,
  getOption,
  optionsOfKind,
} from "@/lib/event";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PurchaseKind, PurchaseOption } from "@/types/event";

function summary(option: PurchaseOption): string {
  if (option.admits > 1) return `${option.admits} QR codes, one for each person`;
  if (option.kind === "TABLE") return "1 QR code for your table";
  return "1 QR code";
}

/**
 * Choose what you're buying: a ticket, a group of 5, or a table. Real radios
 * underneath (so keyboards and screen readers work), and it always shows the
 * total and how many QR codes you'll get.
 */
export function PurchasePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}) {
  const selected = getOption(value);

  function selectKind(next: PurchaseKind) {
    if (next === selected.kind) return;
    const choices = optionsOfKind(next);
    // Moving between ticket and group keeps the tier (Regular / VIP).
    const sameTier =
      next === "TABLE" ? undefined : choices.find((o) => o.premium === selected.premium);
    onChange((sameTier ?? choices[0]).id);
  }

  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="text-sm font-semibold">What are you buying?</legend>

      <div
        role="tablist"
        aria-label="Purchase type"
        className="grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1"
      >
        {OPTION_KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={selected.kind === kind}
            onClick={() => selectKind(kind)}
            className={cn(
              "rounded-lg px-2 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected.kind === kind
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {optionsOfKind(selected.kind).map((option) => {
          const isSelected = option.id === value;
          const Icon =
            option.kind === "TABLE" ? Armchair : option.kind === "GROUP" ? Users : Star;
          return (
            <label
              key={option.id}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3.5 last:odd:col-span-2 transition-[border-color,background-color,box-shadow] focus-within:ring-3 focus-within:ring-ring/40",
                isSelected
                  ? "border-primary bg-primary/12 shadow-[0_0_26px_oklch(0.58_0.235_27/0.28)]"
                  : "border-input bg-card hover:border-muted-foreground/60",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="optionId"
                value={option.id}
                checked={isSelected}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {option.premium || option.kind !== "TICKET" ? (
                    <Icon
                      className={cn("size-3.5", option.premium && option.kind !== "TABLE" && "fill-cream text-cream")}
                      aria-hidden="true"
                    />
                  ) : null}
                  {option.kind === "TABLE" ? "Table" : option.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {isSelected ? <Check className="size-3" strokeWidth={4} /> : null}
                </span>
              </span>
              <span className="font-poster text-[1.75rem] leading-none tracking-wide">
                {formatNaira(option.priceNaira)}
              </span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </label>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 text-sm"
      >
        <span className="text-muted-foreground">{summary(selected)}</span>
        <span className="font-heading text-base font-extrabold">
          {formatNaira(selected.priceNaira)}
        </span>
      </p>
    </fieldset>
  );
}
