"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { Check, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/feedback/spinner";
import { useRegistrationQr } from "@/hooks/use-registration";
import { EVENT } from "@/lib/event";
import { cn } from "@/lib/utils";
import type { Registration } from "@/types/registration";
import { QrCode } from "./qr-code";
import { QrFrame } from "./qr-frame";
import { QrSkeleton } from "./qr-skeleton";

type SaveState = "idle" | "working" | "saved" | "error";

/**
 * Loads the registration's QR from the backend and shows it large, with
 * Download and Print. The QR is the same before and after payment; only the
 * caption under it changes.
 */
export function QrPanel({ registration }: { registration: Registration }) {
  const { state, retry } = useRegistrationQr(registration.id);
  const [save, setSave] = useState<SaveState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function downloadPass(token: string) {
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
        eventName: EVENT.name,
        date: EVENT.date,
        location: EVENT.location,
      });
      downloadBlob(blob, `${registration.reference}-qr.png`);
      setSave("saved");
      resetTimer.current = setTimeout(() => setSave("idle"), 2500);
    } catch {
      setSave("error");
    }
  }

  const paid = registration.paymentStatus === "PAID";

  return (
    <div className="flex flex-col items-center gap-4">
      <QrFrame scanning={state.status === "ready"}>
        {state.status === "ready" ? (
          <QrCode
            token={state.data.token}
            label={`QR code for registration ${registration.reference}`}
          />
        ) : (
          <QrSkeleton />
        )}
      </QrFrame>

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
          {paid ? "QR ready · Payment confirmed" : "QR ready · Payment pending"}
        </p>
      )}

      {state.status === "ready" ? (
        <div className="flex w-full flex-col gap-2 print:hidden">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => downloadPass(state.data.token)}
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
                    <Download /> Download QR
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
            <Printer /> Print
          </Button>
        </div>
      ) : null}
    </div>
  );
}
