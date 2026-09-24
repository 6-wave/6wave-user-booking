import { Beams } from "./beams";

/**
 * The still hero: what you see before the WebGL club loads, and all that's
 * shown on Data Saver or without WebGL. Same colours, CSS beams.
 */
export function HeroPoster() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_112%,oklch(0.42_0.19_27/0.8),transparent_62%),radial-gradient(ellipse_at_50%_-8%,oklch(0.3_0.14_27/0.6),transparent_55%)] bg-ink"
    >
      <Beams />
    </div>
  );
}
