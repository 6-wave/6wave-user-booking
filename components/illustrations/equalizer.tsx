import { cn } from "@/lib/utils";

/** Audio-equaliser bars that bounce: the "sound wave" of the name. */
export function Equalizer({
  bars = 24,
  className,
}: {
  bars?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-end gap-[3px]", className)}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          className="h-full flex-1 origin-bottom animate-eq rounded-t-[2px] bg-linear-to-t from-red to-ember"
          style={{
            animationDelay: `${-((i * 0.37) % 1.1).toFixed(2)}s`,
            animationDuration: `${(0.8 + ((i * 7) % 5) * 0.15).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}
