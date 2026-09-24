"use client";

import { AnimatePresence, m } from "motion/react";
import { TriangleAlert } from "lucide-react";

/** Banner for errors that aren't about a single field (e.g. server errors). */
export function FormError({
  title,
  message,
}: {
  title: string;
  message: string | null;
}) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <m.div
          key="form-error"
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm">
            <TriangleAlert
              className="mt-0.5 size-5 shrink-0 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-destructive">{title}</p>
              <p className="mt-0.5 text-foreground/75">{message}</p>
            </div>
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
