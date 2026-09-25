"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Check, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/feedback/spinner";
import { useRegistrationQr } from "@/hooks/use-registration";
import { EVENT, getOption } from "@/lib/event";
import { cn } from "@/lib/utils";
import type { Registration } from "@/types/registration";
import { QrCode } from "./qr-code";
import { QrFrame } from "./qr-frame";
import { QrSkeleton } from "./qr-skeleton";

type SaveState = "idle" | "working" | "saved" | "error";

/**
 * Loads the registration's QR codes from the backend and shows them large,
 * with Download and Print. A ticket or table has one code; a group of five
 * has five (one per person) shown one at a time with a Guest 1–5 selector.
 * The codes are the same before and after payment; only the caption changes.
 */
export function QrPanel({ registration }: { registration: Registration }) {
  const { state, retry } = useRegistrationQr(registration.id);
  const [index, setIndex] = useState(0);
  const [save, setSave] = useState<SaveState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const option = getOption(registration.optionId);
  const tokens = state.status === "ready" ? state.data.tokens : [];
  const multi = tokens.length > 1;
  const current = tokens[Math.min(index, Math.max(tokens.length - 1, 0))];
  const guestLabel = (i: number) => `Guest ${i + 1} of ${tokens.length}`;

  async function downloadPass(token: string, i: number) {
    setSave("working");
    try {
      // Loaded on demand so the image code isn't in the initial bundle.
      const { createPassImage, downloadBlob } = await import(
        "@/lib/qr/pass-image"
      );
      const blob = await createPassImage({
        token,
        displayName: registration.displayName,
        reference: registration.reference,
        eventName: `${EVENT.name}: ${EVENT.subtitle}`,
        pillText: option.kind === "TICKET" ? `${option.label} ticket` : option.label,
        premium: option.premium,
        passLabel: multi ? guestLabel(i) : undefined,
        date: `${EVENT.date} · ${EVENT.time}`,
        location: EVENT.venue,
      });
      downloadBlob(
        blob,
        multi
          ? `${registration.reference}-guest-${i + 1}.png`
          : `${registration.reference}-qr.png`,
      );
      setSave("saved");
      resetTimer.current = setTimeout(() => setSave("idle"), 2500);
    } catch {
      setSave("error");
    }
  }

  const paid = registration.paymentStatus === "PAID";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("flex w-full flex-col items-center gap-4", multi && "print:hidden")}>
        <QrFrame scanning={state.status === "ready"}>
          {current ? (
            <QrCode
              key={current}
              token={current}
              label={
                multi
                  ? `QR code ${index + 1} of ${tokens.length} for registration ${registration.reference}`
                  : `QR code for registration ${registration.reference}`
              }
            />
          ) : (
            <QrSkeleton />
          )}
        </QrFrame>

        {multi ? (
          <div className="flex w-full flex-col items-center gap-2">
            <div
              role="tablist"
              aria-label="Choose a guest's QR code"
              className="flex items-center justify-center gap-2"
            >
              <span aria-hidden="true" className="mr-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Guest
              </span>
              {tokens.map((token, i) => (
                <button
                  key={token}
                  type="button"
                  role="tab"
                  aria-label={`Guest ${i + 1}`}
                  aria-selected={i === index}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "grid size-10 place-items-center rounded-full text-sm font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    i === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {tokens.length} QR codes, one for each person. Send each guest
              their own.
            </p>
          </div>
        ) : null}

        {state.status === "error" || state.status === "not-found" ? (
          <div role="alert" className="text-center text-sm">
            <p className="text-destructive">
              {state.status === "error"
                ? state.message
                : "We couldn't find this QR code."}
            </p>
            <Button variant="outline" size="sm" className="mt-2" onClick={retry}>
              Try again
            </Button>
          </div>
        ) : (
          <p
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              paid
                ? "bg-success-soft text-success"
                : "bg-warning-soft text-warning-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                paid ? "bg-success" : "bg-warning",
              )}
            />
            {paid
              ? `${multi ? "QR codes" : "QR"} ready · Payment confirmed`
              : `${multi ? "QR codes" : "QR"} ready · Payment pending`}
          </p>
        )}

        {current ? (
          <div className="flex w-full flex-col gap-2 print:hidden">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => downloadPass(current, index)}
              disabled={save === "working"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={save}
                  className="inline-flex items-center gap-2"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                >
                  {save === "working" ? (
                    <>
                      <Spinner /> Preparing…
                    </>
                  ) : save === "saved" ? (
                    <>
                      <Check className="size-4 text-success" /> Saved
                    </>
                  ) : (
                    <>
                      <Download />
                      {multi ? `Download Guest ${index + 1}'s QR` : "Download QR"}
                    </>
                  )}
                </m.span>
              </AnimatePresence>
            </Button>
            {save === "error" ? (
              <p role="alert" className="text-center text-xs text-destructive">
                Couldn&apos;t save the image. Take a screenshot of this QR code
                instead.
              </p>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="self-center text-muted-foreground"
              onClick={() => window.print()}
            >
              <Printer /> {multi ? "Print all" : "Print"}
            </Button>
          </div>
        ) : null}
      </div>

      {/* Printing a group: every guest's code on the page, ready to cut up. */}
      {multi ? (
        <div className="hidden w-full grid-cols-2 gap-6 print:grid">
          {tokens.map((token, i) => (
            <figure key={token} className="break-inside-avoid text-center">
              <div className="aspect-square w-full overflow-hidden rounded-xl border">
                <QrCode
                  token={token}
                  animate={false}
                  label={`QR code ${i + 1} of ${tokens.length} for registration ${registration.reference}`}
                />
              </div>
              <figcaption className="mt-2 font-bold">
                {registration.reference} · Guest {i + 1} of {tokens.length}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </div>
  );
}
