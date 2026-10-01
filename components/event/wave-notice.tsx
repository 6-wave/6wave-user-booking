import { Clock } from "lucide-react";
import { getCurrentWave } from "@/lib/event";
import { cn } from "@/lib/utils";

/** "Wave 1 · on sale until 20 October", or "D Day · final prices" once the last wave starts. */
export function WaveNotice({ className }: { className?: string }) {
  const wave = getCurrentWave();
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-primary/60 bg-primary/10 px-3.5 py-1.5 text-sm font-bold text-foreground",
        className,
      )}
    >
      <Clock className="size-4 text-primary" aria-hidden="true" />
      {wave.label}
      <span className="font-medium text-muted-foreground">
        {wave.endsLabel ? `· on sale until ${wave.endsLabel}` : "· final prices"}
      </span>
    </p>
  );
}
