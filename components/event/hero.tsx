import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { formatNaira } from "@/lib/format";
import { HeroStage } from "./hero-stage";

export function Hero() {
  // "Pool Party 2026": the year drops onto its own line like a poster date.
  const words = EVENT.name.split(" ");
  const year = /^\d{4}$/.test(words[words.length - 1]) ? words.pop() : undefined;

  return (
    <HeroStage>
      <div className="mx-auto w-full max-w-5xl px-4 pt-10 pb-80 md:pt-20 md:pb-40">
        <div className="max-w-xl">
          <Reveal>
            <ul className="flex flex-wrap gap-2">
              {[EVENT.ageNote, `${formatNaira(EVENT.feeNaira)} entry`].map(
                (pill) => (
                  <li
                    key={pill}
                    className="rounded-full border-2 border-gold bg-ocean/30 px-4 py-1 text-sm font-bold text-white backdrop-blur-sm"
                  >
                    {pill}
                  </li>
                ),
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 font-extrabold uppercase">
              <span className="block bg-linear-to-b from-sun via-gold to-gold bg-clip-text text-[3.4rem] leading-[0.92] font-stretch-semi-condensed text-transparent drop-shadow-[0_4px_0_oklch(0.42_0.09_75)] sm:text-8xl">
                {words.join(" ")}
              </span>
              {year ? (
                <>
                  {" "}
                  <span className="mt-2 block text-2xl font-bold tracking-[0.35em] text-white drop-shadow-[0_2px_8px_oklch(0.2_0.05_215/0.5)] sm:text-4xl">
                    {year}
                  </span>
                </>
              ) : null}
            </h1>
            <p className="mt-2 font-script text-4xl text-white drop-shadow-[0_2px_10px_oklch(0.2_0.05_215/0.55)] sm:text-5xl">
              {EVENT.tagline}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
              {EVENT.description}
            </p>
          </Reveal>

          <Reveal delay={0.24} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="sun" className="group overflow-hidden">
              <Link href="/register">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[18%] animate-sheen bg-linear-to-r from-transparent via-white/60 to-transparent"
                />
                Register Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="glass">
              <Link href="/lookup">Already Registered?</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </HeroStage>
  );
}
