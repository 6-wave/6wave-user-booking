/** Payment state of a registration. Always decided by the backend. */
export type PaymentStatus = "PENDING" | "PAID";

export type RegistrationStatus = "CONFIRMED" | "CANCELLED";

/**
 * What the backend tells the frontend about a registration.
 *
 * - `id` is an opaque identifier used in URLs and API paths.
 * - `reference` is the human-friendly number (e.g. POOL-83921) shown to the user.
 * - `displayName` is already shortened by the backend (e.g. "George O."), so the
 *   frontend never needs to hold or show a full name after the form is submitted.
 */
export interface Registration {
  id: string;
  reference: string;
  displayName: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  createdAt: string;
}

/**
 * The QR value is an opaque token issued by the backend. It carries no personal
 * or payment data and is rendered as-is.
 */
export interface RegistrationQr {
  registrationId: string;
  token: string;
}

export interface CreateRegistrationInput {
  fullName: string;
  /** E.164, e.g. +2348012345678 */
  phone: string;
  email: string;
}

export interface LookupRegistrationInput {
  /** e.g. POOL-83921 */
  reference: string;
  /** E.164, e.g. +2348012345678 */
  phone: string;
}
