"use client";

import { Check, Star } from "lucide-react";
import { EVENT } from "@/lib/event";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TicketType } from "@/types/event";

/**
 * Two big tap targets: Regular and VIP. A real radio group underneath, so
 * keyboards and screen readers get proper arrow-key selection.
 */
export function TicketPicker({
  value,
  onChange,
  disabled,
}: {
  value: TicketType;
  onChange: (type: TicketType) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-sm font-semibold">Choose your ticket</legend>
      <div className="grid grid-cols-2 gap-3">
        {EVENT.tickets.map((ticket) => {
          const selected = value === ticket.type;
          return (
            <label
              key={ticket.type}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3.5 transition-[border-color,background-color,box-shadow] focus-within:ring-3 focus-within:ring-ring/40",
                selected
                  ? "border-primary bg-primary/12 shadow-[0_0_26px_oklch(0.58_0.235_27/0.28)]"
                  : "border-input bg-card hover:border-muted-foreground/60",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name="ticketType"
                value={ticket.type}
                checked={selected}
                onChange={() => onChange(ticket.type)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {ticket.type === "VIP" ? (
                    <Star className="size-3.5 fill-cream text-cream" aria-hidden="true" />
                  ) : null}
                  {ticket.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-5 place-items-center rounded-full border-2 transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {selected ? <Check className="size-3" strokeWidth={4} /> : null}
                </span>
              </span>
              <span className="font-poster text-[1.9rem] leading-none tracking-wide">
                {formatNaira(ticket.priceNaira)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
