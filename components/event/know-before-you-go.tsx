import { Clock, QrCode, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import { RingFloat } from "@/components/illustrations/ring-float";
import { Watermelon } from "@/components/illustrations/watermelon";
import { Parallax } from "@/components/motion/parallax";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { EVENT } from "@/lib/event";

// One icon per item in EVENT.knowBeforeYouGo, in the same order.
const ICONS: LucideIcon[] = [QrCode, ShieldCheck, Wallet, Clock];
const TINTS = [
  "bg-sun text-ocean",
  "bg-aqua text-ocean",
  "bg-coral text-white",
  "bg-palm text-white",
];

export function KnowBeforeYouGo() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:py-20">
      <Parallax
        distance={34}
        aria-hidden="true"
        className="pointer-events-none absolute top-4 right-2 w-16 sm:top-6 sm:right-10 sm:w-36"
      >
        <Watermelon className="rotate-12 animate-float" />
      </Parallax>
      <Parallax
        distance={-26}
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 left-2 hidden w-40 opacity-90 sm:block"
      >
        <RingFloat id="know-ring" shadow={false} className="animate-float [animation-delay:-2s]" />
      </Parallax>
      <h2 className="text-2xl font-bold sm:text-3xl">Good to know</h2>
      <p className="mt-2 max-w-[13rem] text-muted-foreground sm:max-w-none">
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
