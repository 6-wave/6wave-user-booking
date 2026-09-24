/** Status of a single payment attempt, as reported by the backend. */
export type PaymentTransactionStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "ABANDONED";

export interface PaymentInitialization {
  /** Payment reference used to look the payment up later. */
  reference: string;
  /** Hosted checkout URL returned by the backend (Paystack `authorization_url`). */
  authorizationUrl: string;
  /** Amount in Naira. */
  amount: number;
}

export interface PaymentTransaction {
  reference: string;
  registrationId: string;
  status: PaymentTransactionStatus;
  /** Amount in Naira. */
  amount: number;
}

/**
 * UI state of the pay screen. `success` is only ever reached after the backend
 * reports the payment as successful, never because a button was clicked.
 */
export type PaymentFlowState =
  | { phase: "idle" }
  | { phase: "initializing" }
  | { phase: "checkout"; init: PaymentInitialization }
  | { phase: "verifying"; reference: string; slow: boolean }
  | { phase: "success"; reference: string }
  | { phase: "failed"; reference: string }
  | { phase: "cancelled"; reference: string }
  | { phase: "error"; message: string };
