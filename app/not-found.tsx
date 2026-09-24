import Link from "next/link";
import { Compass } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-primary">
        <Compass className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/">Go to the home page</Link>
      </Button>
    </PageShell>
  );
}
