/**
 * How much of the club effect a device gets.
 *  - none: static poster only (Data Saver, no WebGL, very low memory)
 *  - lite: the shader at reduced resolution, ~30 fps, fewer beams/embers (phones)
 *  - full: the shader at full detail, uncapped (desktops)
 */
export type ClubTier = "none" | "lite" | "full";

export interface ClubScene {
  /** 0 at the top of the page, 1 once the hero has scrolled away. */
  setScroll(progress: number): void;
  /** Pointer position in -1..1 (parallax + beam sway; desktop only). */
  setPointer(x: number, y: number): void;
  /** A bass-hit shockwave where the screen point was tapped. */
  pulse(clientX: number, clientY: number, strength?: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  /** Draw a single still frame (reduced motion). */
  renderOnce(): void;
  dispose(): void;
}

export interface ClubOptions {
  /** Lite settings: lower resolution, ~30 fps, fewer beams and embers. */
  lite: boolean;
  onContextLost?: () => void;
}
