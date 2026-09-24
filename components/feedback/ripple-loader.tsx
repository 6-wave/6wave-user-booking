import { Waves } from "lucide-react";

/** Expanding rings around a wave icon: "we're working on it". */
export function RippleLoader() {
  return (
    <div className="relative mb-4 grid size-24 place-items-center" aria-hidden="true">
      {[0, 0.8, 1.6].map((delay) => (
        <span
          key={delay}
          className="absolute inset-0 animate-ripple rounded-full border-2 border-primary/60"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
      <span className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
        <Waves className="size-7 animate-float" />
      </span>
    </div>
  );
}
