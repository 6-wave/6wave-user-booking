"use client";

import { m } from "motion/react";
import { cn } from "@/lib/utils";

export type MarkTone = "success" | "failed" | "cancelled" | "pending";

const TONES: Record<MarkTone, { ring: string; soft: string; stroke: string }> =
  {
    success: {
      ring: "text-success",
      soft: "bg-success-soft",
      stroke: "stroke-success",
    },
    failed: {
      ring: "text-destructive",
      soft: "bg-destructive/10",
      stroke: "stroke-destructive",
    },
    cancelled: {
      ring: "text-muted-foreground",
      soft: "bg-muted",
      stroke: "stroke-muted-foreground",
    },
    pending: {
      ring: "text-warning",
      soft: "bg-warning-soft",
      stroke: "stroke-warning",
    },
  };

const GLYPHS: Record<MarkTone, string> = {
  success: "M15 33 L27 45 L49 21",
  failed: "M22 22 L42 42 M42 22 L22 42",
  cancelled: "M20 32 H44",
  pending: "M32 18 V33 L42 39",
};

/**
 * A circle that draws itself, then its glyph, over a soft pulsing halo.
 * Used for the "registered" and payment result moments.
 */
export function StatusMark({
  tone,
  className,
}: {
  tone: MarkTone;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn("relative grid size-24 place-items-center", className)}
      aria-hidden="true"
    >
      <m.span
        className={cn("absolute inset-0 rounded-full", t.soft)}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
      />
      <m.span
        className={cn("absolute inset-0 rounded-full border-2 border-current", t.ring)}
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.45, ease: "easeOut" }}
      />
      <svg viewBox="0 0 64 64" className="relative size-full">
        {/* Rotated so the circle starts drawing from the top. */}
        <g transform="rotate(-90 32 32)">
          <m.circle
            cx="32"
            cy="32"
            r="27"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            className={t.stroke}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </g>
        <m.path
          d={GLYPHS[tone]}
          fill="none"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={t.stroke}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
