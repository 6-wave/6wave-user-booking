import Link from "next/link";
import { SearchX, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder card shown while a registration loads. */
export function LoadingCard() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="space-y-4 card-pop rounded-3xl p-6"
    >
      <Skeleton className="mx-auto size-16 rounded-full" />
      <Skeleton className="mx-auto h-6 w-2/3" />
      <Skeleton className="mx-auto h-4 w-1/2" />
      <Skeleton className="mx-auto aspect-square w-full max-w-[16rem] rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function NotFoundCard() {
  return (
    <div className="card-pop rounded-3xl p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-bold">Registration not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We couldn&apos;t find this registration. The link may be incomplete.
        You can look it up with your registration number and phone number.
      </p>
      <Button asChild size="lg" className="mt-6 w-full">
        <Link href="/lookup">Find my registration</Link>
      </Button>
    </div>
  );
}

export function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="card-pop rounded-3xl p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button size="lg" className="mt-6 w-full" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
