import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { HeroStage } from "./hero-stage";

export function Hero() {
  return (
    <HeroStage>
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-44 md:pt-16 md:pb-56">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.42em] text-white/85 uppercase sm:text-sm">
              {EVENT.presenter}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-3">
              <span className="block bg-linear-to-b from-red-bright to-red bg-clip-text font-poster text-[clamp(4.75rem,27vw,10rem)] leading-[0.84] tracking-tight text-transparent uppercase drop-shadow-[0_0_30px_oklch(0.58_0.235_27/0.55)]">
                {EVENT.name}
              </span>
              <span className="mt-1 block -rotate-3 font-script text-[clamp(2rem,9vw,3.5rem)] leading-none text-cream drop-shadow-[0_2px_10px_oklch(0.1_0.006_25/0.8)]">
                {EVENT.subtitle}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16} className="mt-6 flex items-stretch gap-4">
            <div className="bg-red px-3.5 py-2 font-poster text-[2.1rem] leading-[0.95] text-white uppercase sm:text-5xl">
              <span className="block">{EVENT.dateTag.day}</span>
              <span className="block">{EVENT.dateTag.month}</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-poster text-4xl leading-none text-white sm:text-5xl">
                {EVENT.time}
              </span>
              <span className="mt-1 border-b-4 border-red pb-1 text-sm font-bold tracking-wide text-white uppercase">
                {EVENT.timeLabel}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.22} className="mt-5">
            <p className="font-heading text-xl font-extrabold tracking-tight text-white uppercase sm:text-3xl">
              @{EVENT.venue}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-white/80 uppercase sm:text-base">
              {EVENT.address}
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {EVENT.teasers.map((t) => (
                <li key={t.label} className="text-[0.8rem] font-bold text-white uppercase">
                  <span className="mr-1.5 bg-red px-2 py-0.5 tracking-wide">
                    {t.label}
                  </span>
                  - {t.value}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.34} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group overflow-hidden">
              <Link href="/register">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-[18%] animate-sheen bg-linear-to-r from-transparent via-white/45 to-transparent"
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
