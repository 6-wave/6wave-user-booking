import { Parallax } from "@/components/motion/parallax";
import { PalmFrond } from "./palm-frond";
import { RingFloat } from "./ring-float";
import { Watermelon } from "./watermelon";
import { wavePath } from "./wave-path";

// 720 wide = two viewBox widths, so sliding by half loops seamlessly.
const WAVE_A = wavePath(96, 6, 60, 720, 200);
const WAVE_B = wavePath(112, 5, 60, 720, 200);
const WAVE_C = wavePath(128, 4, 60, 720, 200);

/**
 * Register-page banner: sunlit turquoise water with a yellow ring, a
 * watermelon wedge and a palm frond, each on its own scroll-parallax layer.
 * The title sits on the left, over the calm deep-teal corner.
 */
export function WaterBanner({
  title,
  pill,
}: {
  title: string;
  pill: string;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-[linear-gradient(160deg,oklch(0.4_0.09_208),oklch(0.6_0.1_196)_55%,oklch(0.78_0.1_190))] shadow-[0_6px_0_0_oklch(0.3_0.06_210)]">
      {/* Sun */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-12 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.98_0.09_100/0.9),oklch(0.92_0.16_92/0.35)_35%,transparent_65%)]"
      />

      <Parallax
        distance={10}
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 -right-12 w-60"
      >
        <PalmFrond id="banner-palm" flip className="animate-sway origin-[100%_40%]" />
      </Parallax>

      {/* The water sets the banner's height */}
      <svg
        viewBox="0 0 360 150"
        className="relative block h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        <g className="svg-center animate-wave-slow" opacity="0.55">
          <path d={WAVE_A} fill="#8fefe4" />
        </g>
        <g className="svg-center animate-wave" opacity="0.85">
          <path d={WAVE_B} fill="#19a3a8" />
        </g>
        <g className="svg-center animate-wave-slow">
          <path d={WAVE_C} fill="#0e7482" />
        </g>
        <g strokeLinecap="round" fill="none" stroke="#fff" opacity="0.5">
          <path d="M150 104 h30" strokeWidth="3" />
          <path d="M214 120 h22" strokeWidth="2.5" />
          <path d="M120 128 h18" strokeWidth="2.5" />
        </g>
      </svg>

      <Parallax
        distance={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-5 bottom-3 w-[5.5rem]"
      >
        <RingFloat id="banner-ring" className="animate-float" />
      </Parallax>
      <Parallax
        distance={-10}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-[46%] w-14"
      >
        <Watermelon className="-rotate-12 animate-float [animation-delay:-2s]" />
      </Parallax>

      <h1 className="absolute top-4 left-5 font-extrabold text-white drop-shadow-[0_2px_8px_oklch(0.2_0.05_215/0.5)] sm:top-5">
        <span className="text-3xl font-stretch-semi-condensed uppercase sm:text-4xl">
          {title}
        </span>
      </h1>
      <p className="absolute bottom-3 left-4 rounded-full border-2 border-gold bg-ocean/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
        {pill}
      </p>
    </div>
  );
}
