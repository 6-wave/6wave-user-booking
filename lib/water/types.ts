/**
 * How much of the water effect a device gets.
 *  - none: static poster only (Data Saver, no WebGL, very low memory)
 *  - lite: tiny hand-written WebGL water shader, no 3D engine (phones)
 *  - full: the three.js scene with floating 3D objects (desktop)
 */
export type WaterTier = "none" | "lite" | "full";

/** What every water renderer offers the React wrapper. */
export interface WaterScene {
  /** 0 at the top of the page, 1 once the hero has scrolled away. */
  setScroll(progress: number): void;
  /** Pointer position in -1..1 (camera sway; desktop only). */
  setPointer(x: number, y: number): void;
  /** Drop a ripple where the screen point lands on the water. */
  ripple(clientX: number, clientY: number, strength?: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  /** Draw a single still frame (reduced motion). */
  renderOnce(): void;
  dispose(): void;
}

export interface WaterOptions {
  onContextLost?: () => void;
}
