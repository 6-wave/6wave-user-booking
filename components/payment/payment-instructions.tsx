"use client";

import { useRegistration } from "@/hooks/use-registration";
import { ErrorCard, LoadingCard, NotFoundCard } from "@/components/registration/resource-states";
import { BankTransferSteps } from "./bank-transfer-steps";
import { PaymentNotice } from "./payment-notice";

/** The payment page: transfer steps while unpaid, a confirmation once staff mark it paid. */
export function PaymentInstructions({ id }: { id: string }) {
  const { state, retry } = useRegistration(id, { refreshOnFocus: true });

  if (state.status === "loading") return <LoadingCard />;
  if (state.status === "not-found") return <NotFoundCard />;
  if (state.status === "error") return <ErrorCard message={state.message} onRetry={retry} />;

  const registration = state.data;
  if (registration.status === "CANCELLED")
    return <p className="text-muted-foreground">This registration was cancelled.</p>;
  if (registration.paymentStatus === "PAID") return <PaymentNotice status="PAID" />;
  return <BankTransferSteps registration={registration} />;
}
