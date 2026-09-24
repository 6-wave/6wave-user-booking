"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import type { ClubScene, ClubTier } from "@/lib/club/types";
import { cn } from "@/lib/utils";

type ConstrainedNavigator = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/**
 * Decide how much of the effect this device gets *before* downloading any of
 * its code.
 *
 *  - none: Data Saver, no WebGL, or ~1 GB of memory: static poster only
 *  - lite: phones, tablets, ≤2 GB devices: lower resolution, ~30 fps, fewer
 *          beams and embers
 *  - full: desktops: full detail
 */
function chooseTier(): ClubTier {
  const nav = navigator as ConstrainedNavigator;
  if (nav.connection?.saveData) return "none";
  if (nav.deviceMemory !== undefined && nav.deviceMemory <= 1) return "none";

  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl");
  if (!gl) return "none";
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  const phone =
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  const weak = nav.deviceMemory !== undefined && nav.deviceMemory <= 2;
  return phone || weak ? "lite" : "full";
}

/**
 * The hero's WebGL club scene. Loads after first paint and fades in over the
 * static poster; pauses when scrolled away or the tab is hidden; never runs
 * for people who prefer reduced motion (they get one still frame).
 */
export function ClubCanvas({
  progress,
  className,
}: {
  /** Hero scroll progress, 0..1, drives the parallax. */
  progress: MotionValue<number>;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

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

      let create: typeof import("@/lib/club/renderer").createClubScene;
      try {
        create = (await import("@/lib/club/renderer")).createClubScene;
      } catch {
        return; // Keep the poster.
      }
      // Unmounted while the code was downloading (React dev mode remounts):
      // don't touch the canvas, or its context would be left lost.
      if (disposed) return;

      let scene: ClubScene;
      try {
        scene = create(canvas, {
          lite: tier === "lite",
          onContextLost: () => setReady(false),
        });
      } catch (error) {
        // Not fatal (the poster stays), but worth seeing in the console.
        console.warn("[club] WebGL scene unavailable, showing the poster:", error);
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let onScreen = true;
      let tabVisible = !document.hidden;
      const sync = () => {
        if (reduced) return;
        if (onScreen && tabVisible) scene.start();
        else scene.stop();
      };

      const io = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      io.observe(host);

      const ro = new ResizeObserver(() => {
        scene.resize();
        if (reduced) scene.renderOnce();
      });
      ro.observe(canvas);

      const onVisibility = () => {
        tabVisible = !document.hidden;
        sync();
      };
      document.addEventListener("visibilitychange", onVisibility);

      const stopProgress = reduced
        ? () => {}
        : progress.on("change", (v) => scene.setScroll(v));

      const onMove = (event: Event) => {
        const e = event as PointerEvent;
        if (e.pointerType !== "mouse" || reduced) return;
        const rect = host.getBoundingClientRect();
        scene.setPointer(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          ((e.clientY - rect.top) / rect.height) * 2 - 1,
        );
      };
      const onClick = (event: Event) => {
        const e = event as MouseEvent;
        if (reduced) return;
        if ((e.target as Element).closest("a, button, input, select, textarea"))
          return;
        scene.pulse(e.clientX, e.clientY);
      };
      host.addEventListener("pointermove", onMove);
      host.addEventListener("click", onClick);

      scene.resize();
      if (reduced) scene.renderOnce();
      else sync();
      setReady(true);

      cleanup = () => {
        io.disconnect();
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        stopProgress();
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("click", onClick);
        scene.dispose();
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
