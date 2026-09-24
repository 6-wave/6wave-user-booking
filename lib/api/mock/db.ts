import type {
  PaymentStatus,
  RegistrationStatus,
} from "@/types/registration";
import type { PaymentTransactionStatus } from "@/types/payment";
import { EVENT } from "@/lib/event";

/**
 * MOCK ONLY. Stands in for the backend database so the UI can be built and
 * demoed. It lives in localStorage, which means it is NOT secure or
 * authoritative. Delete lib/api/mock/ once the real API is connected.
 */

export interface MockRegistration {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  email: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  qrToken: string;
  createdAt: string;
}

export interface MockPayment {
  reference: string;
  registrationId: string;
  amount: number;
  status: PaymentTransactionStatus;
  /** Simulates the delay between checkout finishing and the backend knowing. */
  pending?: { outcome: PaymentTransactionStatus; settlesAt: number };
}

interface MockDb {
  registrations: MockRegistration[];
  payments: MockPayment[];
}

const STORAGE_KEY = "pool2026:mock-db:v1";

const SEED: MockDb = {
  registrations: [
    {
      id: "rg_demo_paid_0001",
      reference: "POOL-83921",
      fullName: "George Omosigho",
      phone: "+2348012345678",
      email: "george@example.com",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      qrToken: "POOL-2026-8f72a91b4c3d5e6f708192a3b4c5d6e7",
      createdAt: "2026-09-01T09:00:00.000Z",
    },
    {
      id: "rg_demo_pending_0002",
      reference: "POOL-40417",
      fullName: "Amaka Nwosu",
      phone: "+2348098765432",
      email: "amaka@example.com",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      qrToken: "POOL-2026-3c9e1f0a7b2d4c6e8a5f1b3d9e7c2a40",
      createdAt: "2026-09-02T11:30:00.000Z",
    },
  ],
  payments: [],
};

let memoryFallback: MockDb | null = null;

export function readDb(): MockDb {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
    writeDb(SEED);
    return structuredClone(SEED);
  } catch {
    // Storage blocked (private mode, etc.): fall back to memory for this tab.
    memoryFallback ??= structuredClone(SEED);
    return memoryFallback;
  }
}

export function writeDb(db: MockDb): void {
  memoryFallback = db;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Keep the in-memory copy.
  }
}

function randomHex(bytes: number): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(values, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const makeId = (prefix: string) => `${prefix}_${randomHex(8)}`;

/** In production the backend generates an unpredictable token like this. */
export const makeQrToken = () => `${EVENT.referencePrefix}-2026-${randomHex(16)}`;

export function makeReference(existing: Set<string>): string {
  let reference: string;
  do {
    reference = `${EVENT.referencePrefix}-${10000 + Math.floor(Math.random() * 90000)}`;
  } while (existing.has(reference));
  return reference;
}

/** "George Omosigho" -> "George O." (the backend shortens names, not the UI). */
export function toDisplayName(fullName: string): string {
  const [first, ...rest] = fullName.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}
