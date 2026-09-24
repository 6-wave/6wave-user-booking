"use client";

import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { ClubCanvas } from "@/components/club/club-canvas";
import { Crowd } from "@/components/illustrations/crowd";
import { HeroPoster } from "@/components/illustrations/hero-poster";

const SCROLL_RANGE = [0, 720];

/**
 * The hero's layers, each drifting at its own speed as you scroll (and, with a
 * mouse, as you move):
 *
 *   club (WebGL: beams, disco ball, embers, all with their own depth) →
 *   text scrims → your content → crowd in silhouette (fastest, in front)
 */
export function HeroStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const k = reduce ? 0 : 1;

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, SCROLL_RANGE, [0, 1]);
  const clubY = useTransform(scrollY, SCROLL_RANGE, [0, 120 * k]);
  const crowdY = useTransform(scrollY, SCROLL_RANGE, [0, -110 * k]);

  const pointerX = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 18 });
  const crowdX = useTransform(smoothX, [-1, 1], [16 * k, -16 * k]);

  return (
    <section
      className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden bg-ink text-white md:min-h-[780px]"
      onPointerMove={(e) => {
        if (e.pointerType === "mouse")
          pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      }}
    >
      {/* The club: reaches above the hero so it can slide down without a gap. */}
      <m.div style={{ y: clubY }} className="absolute inset-x-0 -top-32 bottom-0">
        <HeroPoster />
        <ClubCanvas progress={progress} />
      </m.div>

      {/* Keep the text readable over bright beams. */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-ink/65 via-ink/20 to-transparent md:from-ink/60" />

      <div className="relative z-20">{children}</div>

      <m.div
        style={{ y: crowdY, x: crowdX }}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 z-30"
      >
        <Crowd className="-ml-[10%] block h-36 w-[120%] md:ml-0 md:h-52 md:w-full" />
      </m.div>
    </section>
  );
}
