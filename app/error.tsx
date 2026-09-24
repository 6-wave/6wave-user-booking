"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageShell className="text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        Please try again. If it keeps happening, contact the organizers.
      </p>
      <Button size="lg" className="mt-6 w-full" onClick={() => retry()}>
        Try again
      </Button>
    </PageShell>
  );
}
