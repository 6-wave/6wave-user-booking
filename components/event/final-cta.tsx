import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PalmFrond } from "@/components/illustrations/palm-frond";
import { RingFloat } from "@/components/illustrations/ring-float";
import { Watermelon } from "@/components/illustrations/watermelon";
import { Parallax } from "@/components/motion/parallax";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="relative isolate overflow-hidden rounded-3xl bg-[linear-gradient(150deg,oklch(0.36_0.08_212),oklch(0.55_0.1_198)_60%,oklch(0.72_0.1_190))] shadow-[0_6px_0_0_oklch(0.28_0.06_212)]">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.98_0.09_100/0.9),oklch(0.92_0.16_92/0.35)_35%,transparent_65%)]"
        />
        <Parallax
          distance={14}
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-20 w-52 opacity-80 sm:-left-16 sm:w-64 sm:opacity-90"
        >
          <PalmFrond id="cta-palm" className="animate-sway origin-[0%_40%]" />
        </Parallax>
        <Parallax
          distance={-22}
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -bottom-8 w-24 sm:right-10 sm:-bottom-3 sm:w-36"
        >
          <RingFloat id="cta-ring" className="animate-float" />
        </Parallax>
        <Parallax
          distance={20}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 left-3 w-14 sm:bottom-4 sm:left-16 sm:w-20"
        >
          <Watermelon className="-rotate-12 animate-float [animation-delay:-1s]" />
        </Parallax>

        <Stagger inView className="relative px-6 pt-16 pb-20 text-center text-white sm:py-20">
          <StaggerItem>
            <h2 className="text-3xl font-extrabold uppercase font-stretch-semi-condensed drop-shadow-[0_2px_8px_oklch(0.2_0.05_215/0.6)] sm:text-5xl">
              Ready to dive in?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-white/90">
              It takes under a minute, and your QR code is ready straight away.
            </p>
          </StaggerItem>
          <StaggerItem className="mt-7 flex flex-col items-center gap-3">
            <Button asChild size="lg" variant="sun" className="group w-full sm:w-auto">
              <Link href="/register">
                Register Now
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Link
              href="/lookup"
              className="text-sm font-semibold text-sun underline-offset-4 hover:underline"
            >
              Already registered? Find my QR code
            </Link>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}
