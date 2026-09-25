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
  optionId: string;
  paymentStatus: PaymentStatus;
  status: RegistrationStatus;
  /** One opaque token per person covered by the purchase. */
  qrTokens: string[];
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

const STORAGE_KEY = "soundwave:mock-db:v3";

const SEED: MockDb = {
  registrations: [
    {
      id: "rg_demo_paid_0001",
      reference: "WAVE-83921",
      fullName: "George Omosigho",
      phone: "+2348012345678",
      email: "george@example.com",
      optionId: "vip",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      qrTokens: ["WAVE-2026-8f72a91b4c3d5e6f708192a3b4c5d6e7"],
      createdAt: "2026-09-01T09:00:00.000Z",
    },
    {
      id: "rg_demo_pending_0002",
      reference: "WAVE-40417",
      fullName: "Amaka Nwosu",
      phone: "+2348098765432",
      email: "amaka@example.com",
      optionId: "regular",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      qrTokens: ["WAVE-2026-3c9e1f0a7b2d4c6e8a5f1b3d9e7c2a40"],
      createdAt: "2026-09-02T11:30:00.000Z",
    },
    {
      id: "rg_demo_group_0003",
      reference: "WAVE-77015",
      fullName: "Chidi Okafor",
      phone: "+2348055556666",
      email: "chidi@example.com",
      optionId: "regular-group",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      qrTokens: [
        "WAVE-2026-a1f0c7d2e94b4a6f8c31d5b70e2a9f01",
        "WAVE-2026-b2e1d8c3fa5c5b70904e26c81f3bad12",
        "WAVE-2026-c3f2e9d40b6d6c81a15f37d92a4cbe23",
        "WAVE-2026-d40300ea1c7e7d92b260488a3b5dcf34",
        "WAVE-2026-e51411fb2d8f8ea3c37159b44c6eda45",
      ],
      createdAt: "2026-09-03T14:10:00.000Z",
    },
    {
      id: "rg_demo_table_0004",
      reference: "WAVE-62208",
      fullName: "Ngozi Adeyemi",
      phone: "+2348033334444",
      email: "ngozi@example.com",
      optionId: "table-150k",
      paymentStatus: "PAID",
      status: "CONFIRMED",
      qrTokens: ["WAVE-2026-f62522ac3e909fb4d4826ac55d7fdb56"],
      createdAt: "2026-09-04T16:45:00.000Z",
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
export const makeQrTokens = (count: number) => Array.from({ length: count }, makeQrToken);

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
