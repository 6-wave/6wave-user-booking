import { EVENT } from "@/lib/event";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground print:hidden">
      © 2026 6wave · {EVENT.name}
    </footer>
  );
}
