"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import type { WaterOptions, WaterScene, WaterTier } from "@/lib/water/types";
import { cn } from "@/lib/utils";

type ConstrainedNavigator = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/**
 * Decide how much water this device gets *before* downloading any water code.
 *
 *  - none: Data Saver, no WebGL, or ~1 GB of memory: static poster only
 *  - lite: phones, tablets and low-memory devices: a tiny raw-WebGL shader,
 *          no 3D engine (about 5 KB instead of ~133 KB gzipped)
 *  - full: desktops: the three.js scene with 3D floating objects
 */
function chooseTier(): WaterTier {
  const nav = navigator as ConstrainedNavigator;
  if (nav.connection?.saveData) return "none";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 1) return "none";

  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
  if (!gl) return "none";
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  const phone =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const weak = nav.deviceMemory !== undefined && nav.deviceMemory <= 2;
  return phone || weak ? "lite" : "full";
}

/**
 * Real-time water (WebGL). Loads after first paint and fades in over the
 * static poster; pauses when scrolled away or the tab is hidden; never runs
 * for people who prefer reduced motion (they get one still frame).
 */
export function WaterCanvas({
  progress,
  onTier,
  className,
}: {
  /** Hero scroll progress, 0..1, drives the camera parallax. */
  progress: MotionValue<number>;
  /** Tells the hero which tier is live so it can show/hide the SVG floaters. */
  onTier?: (tier: WaterTier) => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const onTierRef = useRef(onTier);
  useEffect(() => {
    onTierRef.current = onTier;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.closest("section") ?? canvas.parentElement;
    if (!host) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const tier = chooseTier();
      if (tier === "none") return;

      const options = {
        onContextLost: () => {
          setReady(false);
          onTierRef.current?.("none");
        },
      };

      // Two separate chunks: phones never download the 3D engine.
      let create: (c: HTMLCanvasElement, o: WaterOptions) => WaterScene;
      try {
        create =
          tier === "full"
            ? (await import("@/lib/water/scene")).createWaterScene
            : (await import("@/lib/water/lite")).createLiteWater;
      } catch {
        return; // Keep the poster.
      }
      // Unmounted while the code was downloading (React dev mode remounts):
      // don't touch the canvas, or its context would be left lost.
      if (disposed) return;

      let water: WaterScene;
      try {
        water = create(canvas, options);
      } catch {
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let onScreen = true;
      let tabVisible = !document.hidden;
      const sync = () => {
        if (reduced) return;
        if (onScreen && tabVisible) water.start();
        else water.stop();
      };

      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      io.observe(host);

      const ro = new ResizeObserver(() => {
        water.resize();
        if (reduced) water.renderOnce();
      });
      ro.observe(canvas);

      const onVisibility = () => {
        tabVisible = !document.hidden;
        sync();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const stopProgress = reduced
        ? () => {}
        : progress.on("change", (v) => water.setScroll(v));

      let lastTrail = 0;
      const onMove = (event: Event) => {
        const e = event as PointerEvent;
        if (e.pointerType !== "mouse" || reduced) return;
        const rect = host.getBoundingClientRect();
        water.setPointer(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          ((e.clientY - rect.top) / rect.height) * 2 - 1,
        );
        const now = performance.now();
        if (now - lastTrail > 140) {
          lastTrail = now;
          water.ripple(e.clientX, e.clientY, 0.07);
        }
      };
      const onClick = (event: Event) => {
        const e = event as MouseEvent;
        if (reduced) return;
        if ((e.target as Element).closest("a, button, input, select, textarea"))
          return;
        water.ripple(e.clientX, e.clientY, 0.3);
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("click", onClick);

      water.resize();
      if (reduced) water.renderOnce();
      else sync();
      setReady(true);
      onTierRef.current?.(tier);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        stopProgress();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("click", onClick);
        water.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 size-full transition-opacity duration-1000",
        ready ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
