"use client";

import { m, type HTMLMotionProps, type Variants } from "motion/react";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 26 },
  },
};

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  /** Wait until the block scrolls into view instead of animating on mount. */
  inView?: boolean;
}

/** Reveals its `StaggerItem` children one after another. */
export function Stagger({ inView = false, ...props }: StaggerProps) {
  return (
    <m.div
      variants={container}
      initial="hidden"
      {...(inView
        ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
        : { animate: "show" })}
      {...props}
    />
  );
}

export function StaggerItem(props: Omit<HTMLMotionProps<"div">, "variants">) {
  return <m.div variants={item} {...props} />;
}
