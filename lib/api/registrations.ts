import type {
  CreateRegistrationInput,
  LookupRegistrationInput,
  Registration,
  RegistrationQr,
} from "@/types/registration";
import { apiFetch } from "./client";
import * as mock from "./mock/registrations";

// Every function here maps to one backend endpoint. To go live, replace the
// mock call with the `apiFetch` line shown under each function.

/** POST /api/registrations */
export function createRegistration(
  input: CreateRegistrationInput,
): Promise<Registration> {
  return apiFetch<Registration>("/api/registrations", { method: "POST", body: input });
}

/** GET /api/registrations/lookup?reference=…&phone=… */
export function lookupRegistration(
  input: LookupRegistrationInput,
): Promise<Registration> {
  return mock.lookupRegistration(input);
  // const query = new URLSearchParams(input).toString();
  // return apiFetch<Registration>(`/api/registrations/lookup?${query}`);
}

/** GET /api/registrations/:id */
export function getRegistration(id: string): Promise<Registration> {
  return apiFetch<Registration>(`/api/registrations/${encodeURIComponent(id)}`);
}

/** GET /api/registrations/:id/qr */
export function getRegistrationQr(id: string): Promise<RegistrationQr> {
  return apiFetch<RegistrationQr>(`/api/registrations/${encodeURIComponent(id)}/qr`);
}
