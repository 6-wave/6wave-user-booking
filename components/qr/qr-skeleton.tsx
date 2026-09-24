import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder shaped like a QR code (three finder squares) while it loads. */
export function QrSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading your QR code"
      className="relative aspect-square w-full overflow-hidden rounded-xl bg-white"
    >
      <Skeleton className="absolute top-[12%] left-[12%] size-[22%] rounded-md" />
      <Skeleton className="absolute top-[12%] right-[12%] size-[22%] rounded-md" />
      <Skeleton className="absolute bottom-[12%] left-[12%] size-[22%] rounded-md" />
      <Skeleton className="absolute right-[12%] bottom-[12%] size-[12%] rounded-md" />
      <Skeleton className="absolute top-[42%] left-[42%] size-[16%] rounded-md" />
    </div>
  );
}
