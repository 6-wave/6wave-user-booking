"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Burst } from "@/components/feedback/burst";
import { StatusMark } from "@/components/feedback/status-mark";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { PaymentBadge } from "@/components/payment/payment-badge";
import { PaymentNotice } from "@/components/payment/payment-notice";
import { QrPanel } from "@/components/qr/qr-panel";
import { Button } from "@/components/ui/button";
import { useRegistration } from "@/hooks/use-registration";
import { DetailList, DetailRow } from "./detail-list";
import { PurchaseBadge } from "./purchase-badge";
import {
  ErrorCard,
  LoadingCard,
  NotFoundCard,
} from "./resource-states";

/** Shown right after registering: the QR already exists, payment is optional for now. */
export function RegistrationSuccess({ id }: { id: string }) {
  const { state, retry } = useRegistration(id);

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "not-found") return <NotFoundCard />;
  if (state.status === "error")
    return <ErrorCard message={state.message} onRetry={retry} />;

  const registration = state.data;
  const paid = registration.paymentStatus === "PAID";

  return (
    <Stagger className="space-y-5">
      <StaggerItem className="relative flex flex-col items-center text-center">
        <div className="relative">
          <StatusMark tone="success" />
          <Burst />
        </div>
        <h1 className="mt-4 text-3xl font-bold">Registration Successful</h1>
        <p className="mt-1 text-muted-foreground">
          You&apos;re on the list, {registration.displayName}
        </p>
      </StaggerItem>

      <StaggerItem className="card-pop rounded-3xl p-5">
        <DetailList>
          <DetailRow label="Registration">
            <span className="font-mono text-lg tracking-wide">
              {registration.reference}
            </span>
          </DetailRow>
          <DetailRow label="Purchase">
            <PurchaseBadge optionId={registration.optionId} />
          </DetailRow>
          <DetailRow label="Payment">
            <PaymentBadge status={registration.paymentStatus} />
          </DetailRow>
        </DetailList>
      </StaggerItem>

      <StaggerItem className="card-pop rounded-3xl p-5">
        <QrPanel registration={registration} />
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
          Save this QR code. You will need it when you arrive at the event.
        </p>
      </StaggerItem>

      <StaggerItem className="space-y-3 print:hidden">
        {paid ? (
          <PaymentNotice status="PAID" />
        ) : (
          <>
            <PaymentNotice status="PENDING" />
            <Button asChild size="lg" className="w-full">
              <Link href={`/payment/${registration.id}`}>
                Pay Now <ArrowRight />
              </Link>
            </Button>
          </>
        )}
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href={`/registration/${registration.id}`}>
            View Registration
          </Link>
        </Button>
      </StaggerItem>
    </Stagger>
  );
}
