import Image from "next/image";
import { Reservations } from "@/components/event/reservations";
import { EVENT } from "@/lib/event";

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-5 border-t border-border py-9 text-center text-xs text-muted-foreground print:hidden">
      <Reservations />
      <Image
        src="/brand/all-mask-gang-white.svg"
        alt="All Mask Gang"
        width={504}
        height={728}
        unoptimized
        className="h-16 w-auto opacity-90"
      />
      <p>
        © 2026 {EVENT.name}: {EVENT.subtitle}
      </p>
    </footer>
  );
}
