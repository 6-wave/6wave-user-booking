import type {
  CreateRegistrationInput,
  LookupRegistrationInput,
} from "@/types/registration";
import { EVENT } from "@/lib/event";
import type { TicketType } from "@/types/event";
import { normalizeNigerianPhone } from "./phone";

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type ValidationResult<TInput, TField extends string> =
  | { ok: true; value: TInput }
  | { ok: false; errors: FieldErrors<TField> };

export type RegistrationField = "fullName" | "phone" | "email";
export type LookupField = "reference" | "phone";

export interface RegistrationValues {
  ticketType: TicketType;
  fullName: string;
  phone: string;
  email: string;
}

export interface LookupValues {
  reference: string;
  phone: string;
}

const NAME_PATTERN = /^[\p{L}][\p{L}\p{M}'’.\- ]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFullName(value: string): string | undefined {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name) return "Enter your full name";
  if (!NAME_PATTERN.test(name)) return "Use letters only in your name";
  if (name.split(" ").length < 2) return "Enter your first and last name";
  if (name.length > 80) return "That name is too long";
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value.trim()) return "Enter your phone number";
  if (!normalizeNigerianPhone(value))
    return "Enter a valid Nigerian phone number, e.g. 0801 234 5678";
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address";
  if (!EMAIL_PATTERN.test(email)) return "Enter a valid email address";
  return undefined;
}

const PREFIX = EVENT.referencePrefix;
const REFERENCE_PATTERN = new RegExp(`^${PREFIX}-[A-Z0-9]{4,10}$`);

/** "wave 83921", "WAVE83921" and "wave-83921" all become "WAVE-83921". */
export function normalizeReference(value: string): string {
  const compact = value.trim().toUpperCase().replace(/[\s\-_]/g, "");
  return compact.startsWith(PREFIX)
    ? `${PREFIX}-${compact.slice(PREFIX.length)}`
    : compact;
}

export function validateReference(value: string): string | undefined {
  if (!value.trim()) return "Enter your registration number";
  if (!REFERENCE_PATTERN.test(normalizeReference(value)))
    return `Enter it like ${PREFIX}-83921`;
  return undefined;
}

export function validateRegistration(
  values: RegistrationValues,
): ValidationResult<CreateRegistrationInput, RegistrationField> {
  const errors: FieldErrors<RegistrationField> = {
    fullName: validateFullName(values.fullName),
    phone: validatePhone(values.phone),
    email: validateEmail(values.email),
  };

  const phone = normalizeNigerianPhone(values.phone);
  if (Object.values(errors).some(Boolean) || !phone) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      ticketType: values.ticketType,
      fullName: values.fullName.trim().replace(/\s+/g, " "),
      phone,
      email: values.email.trim().toLowerCase(),
    },
  };
}

export function validateLookup(
  values: LookupValues,
): ValidationResult<LookupRegistrationInput, LookupField> {
  const errors: FieldErrors<LookupField> = {
    reference: validateReference(values.reference),
    phone: validatePhone(values.phone),
  };

  const phone = normalizeNigerianPhone(values.phone);
  if (Object.values(errors).some(Boolean) || !phone) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { reference: normalizeReference(values.reference), phone },
  };
}
