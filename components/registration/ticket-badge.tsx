import { Star } from "lucide-react";
import { getTicket } from "@/lib/event";
import { cn } from "@/lib/utils";
import type { TicketType } from "@/types/event";

/** VIP is a solid cream tag; Regular is a quiet outline. */
export function TicketBadge({
  type,
  className,
}: {
  type: TicketType;
  className?: string;
}) {
  const vip = type === "VIP";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
        vip ? "bg-cream text-ink" : "border border-input text-foreground",
        className,
      )}
    >
      {vip ? <Star className="size-3.5 fill-current" aria-hidden="true" /> : null}
      {getTicket(type).label}
    </span>
  );
}
