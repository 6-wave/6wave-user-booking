import { cn } from "@/lib/utils";

/**
 * Fade-and-rise entrance done in pure CSS, so it plays on first paint without
 * waiting for JavaScript to load. Use `delay` (seconds) to stagger siblings.
 * (Use `Stagger` from ./stagger for content revealed on scroll.)
 */
export function Reveal({
  delay = 0,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { delay?: number }) {
  return (
    <div
      className={cn("animate-reveal", className)}
      style={{ animationDelay: `${delay}s`, ...style }}
      {...props}
    />
  );
}
