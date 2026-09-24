import { Clock, QrCode, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { EVENT } from "@/lib/event";

// One icon per item in EVENT.knowBeforeYouGo, in the same order.
const ICONS: LucideIcon[] = [QrCode, ShieldCheck, Wallet, Clock];
const TINTS = [
  "bg-red text-white",
  "bg-ember text-ink",
  "bg-cream text-ink",
  "bg-white text-ink",
];

export function KnowBeforeYouGo() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:py-20">
      {/* A giant faint word that drifts slower than the page. */}
      <Parallax
        distance={-40}
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 right-0 font-poster text-[7rem] leading-none text-transparent uppercase select-none [-webkit-text-stroke:1px_oklch(0.4_0.08_27/0.55)] sm:text-[11rem]"
      >
        Wave
      </Parallax>

      <h2 className="text-2xl font-bold sm:text-3xl">Good to know</h2>
      <p className="mt-2 text-muted-foreground">
        A few things that make the day smooth.
      </p>

      <Stagger
        inView
        role="list"
        className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2"
      >
        {EVENT.knowBeforeYouGo.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <StaggerItem
              key={item.title}
              role="listitem"
              className="card-pop rounded-2xl p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${TINTS[index % TINTS.length]}`}
                >
                  <Icon className="size-[1.1rem]" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-[1.05rem] leading-tight font-bold">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2.5 text-[0.85rem] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
