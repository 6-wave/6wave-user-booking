import Link from "next/link";
import { LogoMark } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-heading text-lg font-bold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LogoMark className="size-8" />
          6wave
        </Link>
        <Link
          href="/lookup"
          className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          My registration
        </Link>
      </div>
    </header>
  );
}
