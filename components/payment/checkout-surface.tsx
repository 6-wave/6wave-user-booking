"use client";

import type { PaymentInitialization } from "@/types/payment";
import { MockCheckoutSheet } from "./mock-checkout-sheet";

/**
 * The single place where "how the customer actually pays" lives.
 *
 * Today: a demo sheet. When Paystack is connected, replace this with one of:
 *   - a redirect:   window.location.assign(init.authorizationUrl)
 *                   and set the backend's callback URL to /payment/<id>, which
 *                   already verifies `?reference=` on load, or
 *   - Paystack's inline popup, calling `onFinished(init.reference)` from both
 *     its success and close callbacks.
 *
 * Either way `onFinished` only means "the customer is done": the app then
 * asks the backend for the real result and never trusts this callback.
 */
export function CheckoutSurface({
  init,
  onFinished,
}: {
  init: PaymentInitialization;
  onFinished: (reference: string) => void;
}) {
  return <MockCheckoutSheet init={init} onFinished={onFinished} />;
}
