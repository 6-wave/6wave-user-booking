import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Beams } from "@/components/illustrations/beams";
import { Equalizer } from "@/components/illustrations/equalizer";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_130%,oklch(0.45_0.2_27/0.85),transparent_65%)] bg-ink shadow-[0_6px_0_0_oklch(0.08_0.01_25)] ring-1 ring-border">
        <Beams />
        <Equalizer
          bars={40}
          className="absolute inset-x-0 bottom-0 h-16 opacity-60 sm:h-20"
        />
        <Stagger inView className="relative px-6 pt-14 pb-24 text-center text-white sm:py-20 sm:pb-28">
          <StaggerItem>
            <h2 className="font-poster text-[clamp(2.6rem,11vw,4.5rem)] leading-none tracking-wide uppercase drop-shadow-[0_0_24px_oklch(0.58_0.235_27/0.6)]">
              Don&apos;t miss the wave
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-white/85">
              It takes under a minute, and your QR code is ready straight away.
            </p>
          </StaggerItem>
          <StaggerItem className="mt-7 flex flex-col items-center gap-3">
            <Button asChild size="lg" className="group w-full sm:w-auto">
              <Link href="/register">
                Register Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="/lookup"
              className="text-sm font-semibold text-cream underline-offset-4 hover:underline"
            >
              Already registered? Find my QR code
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
