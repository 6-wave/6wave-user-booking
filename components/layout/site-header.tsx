import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background print:hidden">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          aria-label="6ixwave Entertainment, home"
          className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Image
            src="/brand/6ixwave-wordmark-white.svg"
            alt="6ixwave Entertainment"
            width={2131}
            height={441}
            unoptimized
            priority
            className="h-6 w-auto sm:h-7"
          />
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
