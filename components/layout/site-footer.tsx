import Image from "next/image";
import { Reservations } from "@/components/event/reservations";
import { EVENT } from "@/lib/event";

export function SiteFooter() {
  return (
    <footer className="flex flex-col items-center gap-5 border-t border-border py-9 text-center text-xs text-muted-foreground print:hidden">
      <Reservations />
      <Image
        src="/brand/6ixwave-logo-white.svg"
        alt="6ixwave Entertainment"
        width={2131}
        height={585}
        unoptimized
        className="h-9 w-auto opacity-90"
      />
      <p>
        © 2026 {EVENT.organizer} · {EVENT.name}: {EVENT.subtitle}
      </p>
    </footer>
  );
}
