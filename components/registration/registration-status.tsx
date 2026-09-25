"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Ban, RefreshCw } from "lucide-react";
import { Burst } from "@/components/feedback/burst";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { PaymentBadge } from "@/components/payment/payment-badge";
import { PaymentNotice } from "@/components/payment/payment-notice";
import { QrPanel } from "@/components/qr/qr-panel";
import { Button } from "@/components/ui/button";
import { useRegistration } from "@/hooks/use-registration";
import { EVENT } from "@/lib/event";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/registration";
import { DetailList, DetailRow } from "./detail-list";
import { PurchaseBadge } from "./purchase-badge";
import { ErrorCard, LoadingCard, NotFoundCard } from "./resource-states";

/**
 * The participant's own view of their registration: payment status, the same
 * QR they got at signup, and the event details. Read-only. The backend is the
 * only source of truth for payment status.
 */
export function RegistrationStatus({ id }: { id: string }) {
  const { state, refreshing, refreshError, refresh, retry } = useRegistration(
    id,
    { refreshOnFocus: true },
  );

  // Celebrate when a refresh shows the payment has gone through (for example
  // staff recorded it at the gate while this page was open).
  const paymentStatus: PaymentStatus | undefined =
    state.status === "ready" ? state.data.paymentStatus : undefined;
  const [previous, setPrevious] = useState(paymentStatus);
  const [celebrate, setCelebrate] = useState(false);
  if (paymentStatus !== previous) {
    setPrevious(paymentStatus);
    if (previous === "PENDING" && paymentStatus === "PAID") setCelebrate(true);
  }

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "not-found") return <NotFoundCard />;
  if (state.status === "error")
    return <ErrorCard message={state.message} onRetry={retry} />;

  const registration = state.data;
  const cancelled = registration.status === "CANCELLED";

  return (
    <Stagger className="space-y-5">
      <StaggerItem className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            Your registration
          </p>
          <h1 className="mt-1 text-3xl font-bold break-words">
            {registration.displayName}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
          className="mt-1 shrink-0 print:hidden"
          aria-label="Refresh payment status"
        >
          <RefreshCw className={cn(refreshing && "animate-spin")} />
          Refresh
        </Button>
      </StaggerItem>

      {refreshError ? (
        <StaggerItem
          role="status"
          className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground"
        >
          Couldn&apos;t refresh just now, so this may be out of date.
        </StaggerItem>
      ) : null}

      {cancelled ? (
        <StaggerItem className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/8 p-4">
          <Ban className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-semibold text-destructive">
              Registration cancelled
            </p>
            <p className="mt-0.5 text-sm text-foreground/75">
              This registration can&apos;t be used for entry. Please contact
              the organizers if you think this is a mistake.
            </p>
          </div>
        </StaggerItem>
      ) : (
        <>
          <StaggerItem className="relative">
            <PaymentNotice status={registration.paymentStatus} />
            {/* Around the notice, not the QR, so the code is never covered. */}
            {celebrate ? <Burst /> : null}
          </StaggerItem>

          <StaggerItem className="card-pop rounded-3xl p-5">
            <QrPanel registration={registration} />
          </StaggerItem>
        </>
      )}

      <StaggerItem className="card-pop rounded-3xl p-5">
        <DetailList>
          <DetailRow label="Registration">
            <span className="font-mono tracking-wide">
              {registration.reference}
            </span>
          </DetailRow>
          <DetailRow label="Purchase">
            <PurchaseBadge optionId={registration.optionId} />
          </DetailRow>
          <DetailRow label="Payment">
            <PaymentBadge status={registration.paymentStatus} />
          </DetailRow>
          <DetailRow label="Event">
            {EVENT.name}: {EVENT.subtitle}
          </DetailRow>
          <DetailRow label="Date">
            {EVENT.date}, {EVENT.time}
          </DetailRow>
          <DetailRow label="Venue">{EVENT.venue}</DetailRow>
        </DetailList>
      </StaggerItem>

      {!cancelled && registration.paymentStatus === "PENDING" ? (
        <StaggerItem className="print:hidden">
          <Button asChild size="lg" className="w-full">
            <Link href={`/payment/${registration.id}`}>
              Complete Payment <ArrowRight />
            </Link>
          </Button>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Prefer to pay at the gate? Your QR code stays the same.
          </p>
        </StaggerItem>
      ) : null}
    </Stagger>
  );
}
