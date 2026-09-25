import type {
  EventInfo,
  PurchaseKind,
  PurchaseOption,
  SaleWave,
} from "@/types/event";

/**
 * Single source of truth for event details shown across the app. Taken from
 * the official flyer.
 *
 * Prices confirmed by the organizers: Regular ₦7,000, VIP ₦10,000, tables ₦100k to
 * ₦300k, and a group purchase of 5 people. Wave 1 runs 25 September to 18 October;
 * the current prices are assumed to be the Wave 1 prices.
 *
 * TODO(organizers): Wave 2 prices and dates are not decided yet. Add them to
 * `waves` (and give each wave its prices) before 18 October.
 *
 * TODO(organizers), assumptions to confirm:
 *  - a group of 5 costs 5 × the single price (no group discount);
 *  - each person in a group gets their own QR code (the gate scanner marks
 *    each QR as used, so one shared code would only admit one person);
 *  - a table is one QR code. If a table admits a set number of people, change
 *    its `admits` and every guest gets a code;
 *  - the year (inferred as 2026).
 */
export const EVENT: EventInfo = {
  name: "Sound Wave",
  subtitle: "The Ember Prelude",
  shortName: "Sound Wave",
  presenter: "AMG presents",
  description:
    "Lock in your spot in under a minute. Your personal QR code shows up straight away, and it's your way in on the night.",
  referencePrefix: "WAVE",
  date: "31st October",
  dateTag: { day: "31ST", month: "OCT" },
  time: "8PM",
  timeLabel: "Main event",
  venue: "Jinos Lounge/Club",
  address: "5/7 Johnson Street, Onike, Sabo, Yaba.",
  options: [
    { id: "regular", kind: "TICKET", label: "Regular", description: "1 person", priceNaira: 7000, admits: 1, premium: false },
    { id: "vip", kind: "TICKET", label: "VIP", description: "1 person", priceNaira: 10000, admits: 1, premium: true },
    { id: "regular-group", kind: "GROUP", label: "Regular group", description: "5 people", priceNaira: 7000 * 5, admits: 5, premium: false },
    { id: "vip-group", kind: "GROUP", label: "VIP group", description: "5 people", priceNaira: 10000 * 5, admits: 5, premium: true },
    { id: "table-100k", kind: "TABLE", label: "Table ₦100k", description: "Reserved table", priceNaira: 100000, admits: 1, premium: true },
    { id: "table-150k", kind: "TABLE", label: "Table ₦150k", description: "Reserved table", priceNaira: 150000, admits: 1, premium: true },
    { id: "table-200k", kind: "TABLE", label: "Table ₦200k", description: "Reserved table", priceNaira: 200000, admits: 1, premium: true },
    { id: "table-250k", kind: "TABLE", label: "Table ₦250k", description: "Reserved table", priceNaira: 250000, admits: 1, premium: true },
    { id: "table-300k", kind: "TABLE", label: "Table ₦300k", description: "Reserved table", priceNaira: 300000, admits: 1, premium: true },
  ],
  waves: [
    { id: "wave-1", label: "Wave 1", startsOn: "2026-09-25", endsOn: "2026-10-18", endsLabel: "18 October" },
  ],
  teasers: [
    { label: "Hype policy", value: "Undisclosed" },
    { label: "Music policy", value: "Undisclosed" },
  ],
  reservations: [
    { display: "0812 609 0254", tel: "+2348126090254" },
    { display: "0816 639 5695", tel: "+2348166395695" },
  ],
  knowBeforeYouGo: [
    {
      title: "Your QR is your ticket",
      body: "You get it the moment you register. Keep it on your phone or print it. You'll need it at the door.",
    },
    {
      title: "One registration, one entry",
      body: "Your QR code can only be used once, so keep it to yourself.",
    },
    {
      title: "Pay online or at the gate",
      body: "You can pay now, or pay at the venue. Your QR code stays the same either way.",
    },
    {
      title: "Get there early",
      body: "The crowd all shows up at once, so give yourself extra time at the door.",
    },
  ],
};

export const DEFAULT_OPTION_ID = "regular";

export const OPTION_KINDS: { kind: PurchaseKind; label: string }[] = [
  { kind: "TICKET", label: "Ticket" },
  { kind: "GROUP", label: "Group of 5" },
  { kind: "TABLE", label: "Table" },
];

export function getOption(id: string): PurchaseOption {
  return (
    EVENT.options.find((o) => o.id === id) ??
    EVENT.options.find((o) => o.id === DEFAULT_OPTION_ID) ??
    EVENT.options[0]
  );
}

export function isOptionId(id: string | undefined): id is string {
  return !!id && EVENT.options.some((o) => o.id === id);
}

export function optionsOfKind(kind: PurchaseKind): PurchaseOption[] {
  return EVENT.options.filter((o) => o.kind === kind);
}

/** Lowest price on sale, for "From ₦7,000". */
export const LOWEST_PRICE = Math.min(...EVENT.options.map((o) => o.priceNaira));

/**
 * Today's date in Nigeria ("YYYY-MM-DD"). The event is in Lagos, so a wave
 * ends at midnight there, whatever timezone the server runs in.
 */
function todayInLagos(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(now);
}

/**
 * The wave on sale right now, or undefined between or after waves. Display
 * only: the backend decides what is actually on sale and at what price.
 */
export function getCurrentWave(now: Date = new Date()): SaleWave | undefined {
  const today = todayInLagos(now);
  return EVENT.waves.find((w) => w.startsOn <= today && today <= w.endsOn);
}
