import { cn } from "@/lib/utils";

/** Centered single-column container used by the app-style pages. */
export function PageShell({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-md px-4 py-6 sm:py-10", className)}
      {...props}
    />
  );
}
