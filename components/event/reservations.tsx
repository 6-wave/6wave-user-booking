import { Phone } from "lucide-react";
import { EVENT } from "@/lib/event";
import { cn } from "@/lib/utils";

/** "For reservations" with the flyer's numbers as tap-to-call links. */
export function Reservations({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <p className="text-[0.7rem] font-semibold tracking-[0.35em] text-white/70 uppercase">
        For reservations
      </p>
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {EVENT.reservations.map((r) => (
          <li key={r.tel}>
            <a
              href={`tel:${r.tel}`}
              className="inline-flex items-center gap-2 rounded-lg font-heading text-lg font-extrabold tracking-tight text-white outline-none hover:text-cream focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="grid size-7 place-items-center rounded-full bg-red text-white">
                <Phone className="size-3.5" aria-hidden="true" />
              </span>
              {r.display}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
