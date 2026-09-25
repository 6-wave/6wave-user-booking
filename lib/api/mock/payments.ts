import type {
  PaymentInitialization,
  PaymentTransaction,
  PaymentTransactionStatus,
} from "@/types/payment";
import { getOption } from "@/lib/event";
import { ApiError } from "../client";
import { makeId, readDb, writeDb } from "./db";
import { latency } from "./latency";

/** How long the fake "webhook" takes to reach the fake backend. */
const SETTLE_DELAY_MS = 2500;

export async function initializePayment(
  registrationId: string,
): Promise<PaymentInitialization> {
  await latency(700, 1100);
  const db = readDb();
  const registration = db.registrations.find((r) => r.id === registrationId);
  if (!registration) throw new ApiError("Not found", 404);
  if (registration.paymentStatus === "PAID")
    throw new ApiError("This registration is already paid.", 409);

  const amount = getOption(registration.optionId).priceNaira;
  const reference = makeId("PAY");
  db.payments.push({
    reference,
    registrationId,
    amount,
    status: "PENDING",
  });
  writeDb(db);

  return {
    reference,
    authorizationUrl: `mock://checkout/${reference}`,
    amount,
  };
}

export async function getPaymentStatus(
  reference: string,
): Promise<PaymentTransaction> {
  await latency(300, 600);
  const db = readDb();
  const payment = db.payments.find((p) => p.reference === reference);
  if (!payment) throw new ApiError("Not found", 404);

  // Apply the simulated outcome once its delay has passed.
  if (payment.pending && Date.now() >= payment.pending.settlesAt) {
    payment.status = payment.pending.outcome;
    payment.pending = undefined;
    if (payment.status === "SUCCESS") {
      const registration = db.registrations.find(
        (r) => r.id === payment.registrationId,
      );
      if (registration) registration.paymentStatus = "PAID";
    }
    writeDb(db);
  }

  return {
    reference: payment.reference,
    registrationId: payment.registrationId,
    status: payment.status,
    amount: payment.amount,
  };
}

/**
 * MOCK ONLY: stands in for the customer finishing (or abandoning) Paystack
 * checkout and Paystack's webhook reaching the backend. Used solely by the
 * demo checkout sheet.
 */
export function simulateCheckoutOutcome(
  reference: string,
  outcome: Exclude<PaymentTransactionStatus, "PENDING">,
): void {
  const db = readDb();
  const payment = db.payments.find((p) => p.reference === reference);
  if (!payment) return;
  payment.pending = {
    outcome,
    settlesAt:
      Date.now() + (outcome === "ABANDONED" ? 0 : SETTLE_DELAY_MS),
  };
  writeDb(db);
}
