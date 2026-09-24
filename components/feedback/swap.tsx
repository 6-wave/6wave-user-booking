"use client";

import { AnimatePresence, m } from "motion/react";

/** Cross-fades its content whenever `id` changes (e.g. button label states). */
export function Swap({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={id}
        className={className ?? "inline-flex items-center gap-2"}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </m.span>
    </AnimatePresence>
  );
}
