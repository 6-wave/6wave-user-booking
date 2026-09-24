import { cn } from "@/lib/utils";

export function DetailList({
  className,
  ...props
}: React.ComponentProps<"dl">) {
  return <dl className={cn("divide-y divide-border", className)} {...props} />;
}

export function DetailRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0",
        className,
      )}
    >
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-semibold break-words">
        {children}
      </dd>
    </div>
  );
}
