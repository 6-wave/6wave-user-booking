"use client";

import { useState } from "react";
import {
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { HeroPoster } from "@/components/illustrations/hero-poster";
import { PalmFrond } from "@/components/illustrations/palm-frond";
import { WaterCanvas } from "@/components/water/water-canvas";
import type { WaterTier } from "@/lib/water/types";
import { HeroFloaters } from "./hero-floaters";
import { Waves } from "./waves";

const SCROLL_RANGE = [0, 720];

/**
 * The hero's layers, each drifting at its own speed as you scroll (and, with a
 * mouse, as you move):
 *
 *   water: 3D on desktop, a tiny shader on phones (slower than the page) →
 *   floaters (SVG, phones) → sun glow → back palm →
 *   your content (normal speed) → front palms (faster than the page) → waves
 */
export function HeroStage({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const k = reduce ? 0 : 1;
  const [tier, setTier] = useState<WaterTier>("none");

  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, SCROLL_RANGE, [0, 1]);
  const waterY = useTransform(scrollY, SCROLL_RANGE, [0, 150 * k]);
  const sunY = useTransform(scrollY, SCROLL_RANGE, [0, 90 * k]);
  const palmBackY = useTransform(scrollY, SCROLL_RANGE, [0, -60 * k]);
  const palmFrontY = useTransform(scrollY, SCROLL_RANGE, [0, -200 * k]);

  const pointerX = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 18 });
  const palmBackX = useTransform(smoothX, [-1, 1], [10 * k, -10 * k]);
  const palmFrontX = useTransform(smoothX, [-1, 1], [26 * k, -26 * k]);

  return (
    <section
      className="relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden bg-ocean-mid text-white md:min-h-[720px]"
      onPointerMove={(e) => {
        if (e.pointerType === "mouse")
          pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      }}
    >
      {/* Water: reaches above the hero so it can slide down without a gap. */}
      <m.div style={{ y: waterY }} className="absolute inset-x-0 -top-40 bottom-0">
        <HeroPoster />
        <WaterCanvas progress={progress} onTier={setTier} />
      </m.div>

      {/* Light SVG stand-ins for the 3D objects (phones / no WebGL) */}
      <HeroFloaters hidden={tier === "full"} />

      {/* Keeps white text readable over bright water. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[78%] bg-linear-to-b from-ocean/70 via-ocean/30 to-transparent" />

      {/* Sun */}
      <m.div
        style={{ y: sunY }}
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[34rem]"
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.98_0.09_100/0.95)_0%,oklch(0.92_0.16_92/0.45)_28%,transparent_62%)]" />
        <div className="absolute inset-0 animate-spin-slow rounded-full opacity-35 mask-[radial-gradient(circle,black_10%,transparent_68%)] bg-[conic-gradient(from_0deg,transparent_0_6%,white_8%,transparent_10%_24%,white_26%,transparent_28%_46%,white_48%,transparent_50%_68%,white_70%,transparent_72%_88%,white_90%,transparent_92%)]" />
      </m.div>

      {/* Back palm (behind the text) */}
      <m.div
        style={{ y: palmBackY, x: palmBackX }}
        className="pointer-events-none absolute -top-16 -right-24 w-[19rem] opacity-95 md:-top-8 md:-right-20 md:w-[28rem]"
      >
        <PalmFrond id="hero-back" flip className="animate-sway origin-[100%_40%]" />
      </m.div>

      <div className="relative z-20">{children}</div>

      {/* Front palms (over the water, framing the ring) */}
      <m.div
        style={{ y: palmFrontY, x: palmFrontX }}
        className="pointer-events-none absolute -bottom-10 -left-28 z-30 w-[20rem] md:w-[30rem]"
      >
        <PalmFrond id="hero-front-l" className="-scale-y-100 animate-sway origin-[0%_60%]" />
      </m.div>
      <m.div
        style={{ y: palmFrontY, x: palmFrontX }}
        className="pointer-events-none absolute -right-28 -bottom-24 z-30 hidden w-[24rem] md:block"
      >
        <PalmFrond id="hero-front-r" flip className="-scale-y-100 animate-sway origin-[100%_60%]" />
      </m.div>

      <Waves className="z-40" />
    </section>
  );
}
