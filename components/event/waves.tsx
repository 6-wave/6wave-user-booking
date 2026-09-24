import { cn } from "@/lib/utils";

// Two full periods per tile: sliding the 200%-wide SVG by exactly 50% loops seamlessly.
const BACK = "M0 70 Q300 20 600 70 T1200 70 T1800 70 T2400 70 V120 H0Z";
const FRONT = "M0 60 Q300 0 600 60 T1200 60 T1800 60 T2400 60 V120 H0Z";

/** Two layers of gently drifting waves. The front one matches the page background. */
export function Waves({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-16 overflow-hidden sm:h-24",
        className,
      )}
    >
      <svg
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 h-full w-[200%] animate-wave-slow fill-white/35 will-change-transform"
      >
        <path d={BACK} />
      </svg>
      <svg
        viewBox="0 0 2400 120"
        preserveAspectRatio="none"
        className="absolute -bottom-px h-full w-[200%] animate-wave fill-background will-change-transform"
      >
        <path d={FRONT} />
      </svg>
    </div>
  );
}
