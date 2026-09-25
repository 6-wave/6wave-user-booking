/** Payment state of a registration. Always decided by the backend. */
export type PaymentStatus = "PENDING" | "PAID";

export type RegistrationStatus = "CONFIRMED" | "CANCELLED";

/**
 * What the backend tells the frontend about a registration.
 *
 * - `id` is an opaque identifier used in URLs and API paths.
 * - `reference` is the human-friendly number (e.g. WAVE-83921) shown to the user.
 * - `displayName` is already shortened by the backend (e.g. "George O."), so the
 *   frontend never needs to hold or show a full name after the form is submitted.
 */
export interface Registration {
  id: string;
  reference: string;
  displayName: string;
  /** What was bought: an ID from the event's purchase options. */
  optionId: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  createdAt: string;
}

/**
 * QR values are opaque tokens issued by the backend. They carry no personal or
 * payment data and are rendered as-is. A registration has one token per person
 * covered (one for a ticket or table, five for a group of five), so each
 * person can enter with their own code.
 */
export interface RegistrationQr {
  registrationId: string;
  tokens: string[];
}

export interface CreateRegistrationInput {
  /** What the person chose. The backend decides the price for it. */
  optionId: string;
  fullName: string;
  /** E.164, e.g. +2348012345678 */
  phone: string;
  email: string;
}

export interface LookupRegistrationInput {
  /** e.g. WAVE-83921 */
  reference: string;
  /** E.164, e.g. +2348012345678 */
  phone: string;
}
