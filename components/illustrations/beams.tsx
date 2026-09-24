import { cn } from "@/lib/utils";

const BEAMS = [
  { left: "14%", from: "-22deg", to: "10deg", color: "from-red/60", dur: "7s", delay: "0s" },
  { left: "38%", from: "16deg", to: "-14deg", color: "from-ember/45", dur: "9s", delay: "-3s" },
  { left: "62%", from: "-12deg", to: "20deg", color: "from-red/55", dur: "8s", delay: "-5s" },
  { left: "86%", from: "18deg", to: "-18deg", color: "from-ember/40", dur: "10s", delay: "-2s" },
];

/**
 * CSS-only laser beams that sweep: the light version of the hero shader, used
 * on the poster fallback, the register banner and the closing call-to-action.
 */
export function Beams({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {BEAMS.map((b) => (
        <span
          key={b.left}
          className={cn(
            "absolute -top-6 h-[170%] w-44 origin-top animate-beam [animation-fill-mode:both] bg-linear-to-b to-transparent [clip-path:polygon(47%_0,53%_0,100%_100%,0_100%)]",
            b.color,
          )}
          style={
            {
              left: b.left,
              "--from": b.from,
              "--to": b.to,
              animationDuration: b.dur,
              animationDelay: b.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
