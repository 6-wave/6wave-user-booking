/**
 * The still backdrop of the hero: turquoise water in a soft vignette. This is
 * all you see before the water loads, and all that's shown on Data Saver or
 * without WebGL (the floating objects are layered on top by HeroFloaters).
 */
export function HeroPoster() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,#1fa3a6_0%,#0e7482_45%,#044553_100%)]"
    />
  );
}
