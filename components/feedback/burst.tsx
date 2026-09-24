"use client";

import { m } from "motion/react";

const COLORS = ["bg-red", "bg-ember", "bg-cream", "bg-white", "bg-red-bright"];
const COUNT = 22;
const GOLDEN_ANGLE = 137.508;

/**
 * A one-off burst of confetti dots from the centre of its parent. Positions
 * are computed from the index (not random) so it renders identically on the
 * server and the client.
 */
export function Burst() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i * GOLDEN_ANGLE * Math.PI) / 180;
        const distance = 70 + ((i * 37) % 60);
        const size = 6 + (i % 3) * 3;
        return (
          <m.span
            key={i}
            className={`absolute rounded-full ${COLORS[i % COLORS.length]}`}
            style={{ width: size, height: size }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 24,
              scale: [0, 1, 0.8],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.1,
              delay: 0.5 + (i % 5) * 0.03,
              ease: "easeOut",
            }}
          />
        );
      })}
    </div>
  );
}
