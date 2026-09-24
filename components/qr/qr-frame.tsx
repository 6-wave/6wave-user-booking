import { cn } from "@/lib/utils";

const CORNERS = [
  "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
  "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
  "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
  "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
];

/**
 * Card + viewfinder corners around the QR. `scanning` plays a one-off light
 * sweep across the code when it appears. The code stays on plain white so it
 * is always easy for the scanner to read.
 */
export function QrFrame({
  children,
  scanning = false,
  className,
}: {
  children: React.ReactNode;
  scanning?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[19rem] p-3", className)}>
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={cn(
            "absolute size-9 border-primary animate-in fade-in zoom-in-125 duration-500",
            corner,
          )}
        />
      ))}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white shadow-[0_0_48px_oklch(0.58_0.235_27/0.55)] ring-1 ring-white/20">
        {children}
        {scanning ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="h-1/3 animate-scan border-b-2 border-primary bg-gradient-to-b from-transparent to-primary/25 print:hidden" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
