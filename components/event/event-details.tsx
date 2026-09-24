import { Banknote, CalendarDays, MapPin, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { EVENT, LOWEST_PRICE } from "@/lib/event";
import { formatNaira } from "@/lib/format";

function DetailCard({
  icon: Icon,
  label,
  value,
  hint,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tint: string;
}) {
  return (
    <div className="card-pop h-full rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-lg ${tint}`}
        >
          <Icon className="size-[1.1rem]" aria-hidden="true" />
        </span>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      </div>
      <p className="mt-3 font-heading text-[1.1rem] leading-snug font-bold">
        {value}
      </p>
      <p className="mt-0.5 text-[0.85rem] leading-snug text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

/** Date, venue and price, straight off the flyer. Overlaps the hero's crowd for depth. */
export function EventDetails() {
  return (
    <section
      aria-label="Event details"
      className="relative z-10 mx-auto -mt-16 w-full max-w-5xl px-4 sm:-mt-24"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Reveal delay={0.32}>
          <DetailCard
            icon={CalendarDays}
            tint="bg-red text-white"
            label="Date"
            value={EVENT.date}
            hint={`${EVENT.time} · ${EVENT.timeLabel}`}
          />
        </Reveal>
        <Reveal delay={0.4}>
          <DetailCard
            icon={MapPin}
            tint="bg-ember text-ink"
            label="Venue"
            value={EVENT.venue}
            hint={EVENT.address}
          />
        </Reveal>
        <Reveal delay={0.48}>
          <DetailCard
            icon={Banknote}
            tint="bg-cream text-ink"
            label="Tickets"
            value={`From ${formatNaira(LOWEST_PRICE)}`}
            hint={EVENT.tickets
              .map((t) => `${t.label} ${formatNaira(t.priceNaira)}`)
              .join(" · ")}
          />
        </Reveal>
      </div>
    </section>
  );
}
