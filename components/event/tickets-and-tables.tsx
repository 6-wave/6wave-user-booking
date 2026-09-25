import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { OPTION_KINDS, optionsOfKind } from "@/lib/event";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/lib/format";
import { WaveNotice } from "./wave-notice";

const HEADINGS = {
  TICKET: "Tickets",
  GROUP: "Group of 5",
  TABLE: "Tables",
} as const;

/** Everything on sale. Each card opens the form with that option preselected. */
export function TicketsAndTables() {
  return (
    <section
      id="tickets"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-4 pt-14 sm:pt-20"
    >
      <h2 className="text-2xl font-bold sm:text-3xl">Tickets &amp; tables</h2>
      <p className="mt-2 text-muted-foreground">
        Pick yours and register in under a minute.
      </p>
      <WaveNotice className="mt-4" />

      <div className="mt-6 space-y-8">
        {OPTION_KINDS.map(({ kind }) => (
          <div key={kind}>
            <h3 className="mb-3 text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase">
              {HEADINGS[kind]}
              {kind === "GROUP" ? (
                <span className="ml-2 font-medium tracking-normal normal-case">
                  · one QR code for each person
                </span>
              ) : null}
            </h3>
            <Stagger
              inView
              role="list"
              className={cn(
                "grid grid-cols-2 gap-3",
                kind === "TABLE" ? "sm:grid-cols-3" : "sm:grid-cols-4",
              )}
            >
              {optionsOfKind(kind).map((option) => (
                <StaggerItem
                  key={option.id}
                  role="listitem"
                  className="last:odd:col-span-2 sm:last:odd:col-span-1"
                >
                  <Link
                    href={`/register?option=${option.id}`}
                    className="card-pop group flex h-full flex-col gap-1 rounded-2xl p-4 transition-transform outline-none hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      {kind === "TABLE" ? "Table" : option.label}
                    </span>
                    <span className="font-poster text-[1.9rem] leading-none tracking-wide">
                      {formatNaira(option.priceNaira)}
                    </span>
                    <span className="text-[0.8rem] text-muted-foreground">
                      {option.description}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Choose
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))}
      </div>
    </section>
  );
}
