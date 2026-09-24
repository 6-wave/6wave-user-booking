import { Parallax } from "@/components/motion/parallax";
import { Beams } from "./beams";
import { Crowd } from "./crowd";
import { Equalizer } from "./equalizer";

/**
 * Register-page banner: sweeping beams, a crowd in silhouette on its own
 * scroll-parallax layer, and equaliser bars. The title sits over the calm
 * dark corner on the left.
 */
export function ClubBanner({
  title,
  pill,
}: {
  title: string;
  pill: string;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_70%_120%,oklch(0.42_0.19_27/0.8),transparent_60%)] bg-ink shadow-[0_6px_0_0_oklch(0.08_0.01_25)] ring-1 ring-border">
      <Beams />
      <Equalizer bars={14} className="absolute top-3 right-4 h-8 w-24 opacity-90" />
      <div className="relative h-40 sm:h-48">
        <Parallax
          distance={-10}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-1"
        >
          <Crowd className="block h-24 w-full sm:h-28" />
        </Parallax>
      </div>
      <h1 className="absolute top-4 left-5 font-poster text-4xl tracking-wide text-white uppercase drop-shadow-[0_0_18px_oklch(0.58_0.235_27/0.6)] sm:top-5 sm:text-5xl">
        {title}
      </h1>
      <p className="absolute bottom-3 left-4 bg-red px-2.5 py-1 text-xs font-bold tracking-wide text-white uppercase">
        {pill}
      </p>
    </div>
  );
}
