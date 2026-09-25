import { Armchair, Star, Users } from "lucide-react";
import { getOption } from "@/lib/event";
import { cn } from "@/lib/utils";

/** Premium purchases (VIP, VIP group, tables) get a solid cream tag; the rest a quiet outline. */
export function PurchaseBadge({
  optionId,
  className,
}: {
  optionId: string;
  className?: string;
}) {
  const option = getOption(optionId);
  const Icon =
    option.kind === "TABLE"
      ? Armchair
      : option.kind === "GROUP"
        ? Users
        : option.premium
          ? Star
          : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
        option.premium ? "bg-cream text-ink" : "border border-input text-foreground",
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
      {option.label}
    </span>
  );
}
