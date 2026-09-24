import type {
  CreateRegistrationInput,
  LookupRegistrationInput,
  Registration,
  RegistrationQr,
} from "@/types/registration";
import { EVENT } from "@/lib/event";
import { ApiError } from "../client";
import {
  makeId,
  makeQrToken,
  makeReference,
  readDb,
  toDisplayName,
  writeDb,
  type MockRegistration,
} from "./db";
import { latency } from "./latency";

// Demo triggers for exercising error states:
//   register with an email starting "error@"  -> server error
//   look up reference POOL-00000              -> server error
const SERVER_ERROR = "Something went wrong on our side. Please try again.";

function toRegistration(record: MockRegistration): Registration {
  return {
    id: record.id,
    reference: record.reference,
    displayName: toDisplayName(record.fullName),
    paymentStatus: record.paymentStatus,
    status: record.status,
    createdAt: record.createdAt,
  };
}

export async function createRegistration(
  input: CreateRegistrationInput,
): Promise<Registration> {
  await latency(900, 1400);
  if (input.email.startsWith("error@")) throw new ApiError(SERVER_ERROR, 500);

  const db = readDb();
  const record: MockRegistration = {
    id: makeId("rg"),
    reference: makeReference(new Set(db.registrations.map((r) => r.reference))),
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    paymentStatus: "PENDING",
    status: "CONFIRMED",
    qrToken: makeQrToken(),
    createdAt: new Date().toISOString(),
  };
  db.registrations.push(record);
  writeDb(db);
  return toRegistration(record);
}

export async function lookupRegistration(
  input: LookupRegistrationInput,
): Promise<Registration> {
  await latency(800, 1300);
  if (input.reference === `${EVENT.referencePrefix}-00000`) throw new ApiError(SERVER_ERROR, 500);

  const record = readDb().registrations.find(
    (r) => r.reference === input.reference && r.phone === input.phone,
  );
  if (!record) throw new ApiError("Not found", 404);
  return toRegistration(record);
}

export async function getRegistration(id: string): Promise<Registration> {
  await latency(400, 700);
  const record = readDb().registrations.find((r) => r.id === id);
  if (!record) throw new ApiError("Not found", 404);
  return toRegistration(record);
}

export async function getRegistrationQr(id: string): Promise<RegistrationQr> {
  await latency(500, 900);
  const record = readDb().registrations.find((r) => r.id === id);
  if (!record) throw new ApiError("Not found", 404);
  return { registrationId: record.id, token: record.qrToken };
}
