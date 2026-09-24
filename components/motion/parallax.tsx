"use client";

import { useRef } from "react";
import {
  m,
  useReducedMotion,
  useScroll,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";

interface ParallaxProps extends Omit<HTMLMotionProps<"div">, "style"> {
  /**
   * How far (px) the layer travels either side of centre while it crosses the
   * screen. Positive moves it against the scroll (feels closer/faster);
   * negative moves it with the scroll (feels farther/slower).
   */
  distance?: number;
}

/** Scroll-linked vertical drift for a decorative layer. Off for reduced motion. */
export function Parallax({ distance = 60, ...props }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [distance, -distance],
  );
  return <m.div ref={ref} style={{ y }} {...props} />;
}
