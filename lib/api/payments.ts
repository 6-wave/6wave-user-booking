import type {
  PaymentInitialization,
  PaymentTransaction,
} from "@/types/payment";
import * as mock from "./mock/payments";

/** POST /api/payments/initialize */
export function initializePayment(
  registrationId: string,
): Promise<PaymentInitialization> {
  return mock.initializePayment(registrationId);
  // return apiFetch<PaymentInitialization>("/api/payments/initialize", { method: "POST", body: { registrationId } });
}

/**
 * GET /api/payments/:reference
 *
 * The backend verifies the payment with Paystack; the frontend only reads the
 * result. Never treat a checkout callback as proof of payment.
 */
export function getPaymentStatus(reference: string): Promise<PaymentTransaction> {
  return mock.getPaymentStatus(reference);
  // return apiFetch<PaymentTransaction>(`/api/payments/${encodeURIComponent(reference)}`);
}
