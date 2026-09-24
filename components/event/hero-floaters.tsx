"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { BeachBall } from "@/components/illustrations/beach-ball";
import { RingFloat } from "@/components/illustrations/ring-float";
import { cn } from "@/lib/utils";

/**
 * The floating ring, coral ring and beach ball as light SVG on their own
 * parallax layer. They stand in for the 3D objects on phones (which don't run
 * the 3D engine) and whenever there's no WebGL. Hidden once real 3D is up.
 */
export function HeroFloaters({ hidden }: { hidden: boolean }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 720], [0, reduce ? 0 : -60]);

  return (
    <m.div
      style={{ y }}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 transition-opacity duration-700",
        hidden ? "opacity-0" : "opacity-100",
      )}
    >
      <RingFloat
        id="float-main"
        className="absolute bottom-[17%] left-1/2 w-40 -translate-x-1/2 animate-float md:bottom-[24%] md:left-[72%] md:w-56"
      />
      <RingFloat
        id="float-coral"
        tone="coral"
        className="absolute bottom-[9%] left-[4%] w-24 animate-float [animation-delay:-2s] [animation-duration:6s] md:bottom-[8%] md:left-[56%] md:w-28"
      />
      <BeachBall className="absolute right-[7%] bottom-[19%] w-16 animate-float [animation-delay:-3s] [animation-duration:4.6s] md:right-[6%] md:bottom-[34%] md:w-20" />
    </m.div>
  );
}
