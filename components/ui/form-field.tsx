"use client";

import { AnimatePresence, m } from "motion/react";
import { CircleAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "id" | "name"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

/** Label + input + animated error message, wired up for screen readers. */
export function FormField({
  id,
  label,
  error,
  hint,
  ...inputProps
}: FormFieldProps) {
  const describedBy =
    [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      <m.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
      </m.div>
      <AnimatePresence initial={false}>
        {error ? (
          <m.p
            id={`${id}-error`}
            key="error"
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-1.5 overflow-hidden text-sm text-destructive"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </m.p>
        ) : null}
      </AnimatePresence>
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
