import type {
  EventInfo,
  PurchaseKind,
  PurchaseOption,
  SaleWave,
} from "@/types/event";

/** Tables cost the same in every wave. */
function prices(regular: number, vip: number, regularGroup: number, vipGroup: number): Record<string, number> {
  return {
    regular,
    vip,
    "regular-group": regularGroup,
    "vip-group": vipGroup,
    "table-100k": 100000,
    "table-150k": 150000,
    "table-200k": 200000,
    "table-250k": 250000,
    "table-300k": 300000,
  };
}

/**
 * Single source of truth for event details shown across the app. Taken from
 * the official flyer.
 *
 * Prices confirmed by the organizers, per wave (see `waves`): Wave 1 to 20 October,
 * Wave 2 from 21 to 30 October, D Day (31 October) after that. A group of 5 is 10%
 * cheaper than 5 tickets. Tables cost the same in every wave. The backend holds the
 * same schedule and is the one that charges: keep the two in step.
 *
 * TODO(organizers), assumptions to confirm:
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
    { id: "regular", kind: "TICKET", label: "Regular", description: "1 person", admits: 1, premium: false },
    { id: "vip", kind: "TICKET", label: "VIP", description: "1 person", admits: 1, premium: true },
    { id: "regular-group", kind: "GROUP", label: "Regular group", description: "5 people", admits: 5, premium: false },
    { id: "vip-group", kind: "GROUP", label: "VIP group", description: "5 people", admits: 5, premium: true },
    { id: "table-100k", kind: "TABLE", label: "Table ₦100k", description: "Reserved table", admits: 1, premium: true },
    { id: "table-150k", kind: "TABLE", label: "Table ₦150k", description: "Reserved table", admits: 1, premium: true },
    { id: "table-200k", kind: "TABLE", label: "Table ₦200k", description: "Reserved table", admits: 1, premium: true },
    { id: "table-250k", kind: "TABLE", label: "Table ₦250k", description: "Reserved table", admits: 1, premium: true },
    { id: "table-300k", kind: "TABLE", label: "Table ₦300k", description: "Reserved table", admits: 1, premium: true },
  ],
  waves: [
    { id: "wave-1", label: "Wave 1", endsOn: "2026-10-20", endsLabel: "20 October", prices: prices(5000, 15000, 22500, 67500) },
    { id: "wave-2", label: "Wave 2", endsOn: "2026-10-30", endsLabel: "30 October", prices: prices(7000, 18000, 32500, 81000) },
    { id: "d-day", label: "D Day", endsOn: null, endsLabel: null, prices: prices(10000, 20000, 45000, 90000) },
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

export function getOption(id: string, now: Date = new Date()): PurchaseOption {
  const base =
    EVENT.options.find((o) => o.id === id) ??
    EVENT.options.find((o) => o.id === DEFAULT_OPTION_ID) ??
    EVENT.options[0];
  return { ...base, priceNaira: getCurrentWave(now).prices[base.id] };
}

export function isOptionId(id: string | undefined): id is string {
  return !!id && EVENT.options.some((o) => o.id === id);
}

export function optionsOfKind(kind: PurchaseKind, now: Date = new Date()): PurchaseOption[] {
  return EVENT.options.filter((o) => o.kind === kind).map((o) => getOption(o.id, now));
}

/** Lowest price on sale right now, for "From ₦5,000". */
export function getLowestPrice(now: Date = new Date()): number {
  return Math.min(...Object.values(getCurrentWave(now).prices));
}

/**
 * Today's date in Nigeria ("YYYY-MM-DD"). The event is in Lagos, so a wave
 * ends at midnight there, whatever timezone the server runs in.
 */
function todayInLagos(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(now);
}

/**
 * The wave on sale right now. The last wave has no end, so there is always one.
 * Display only: the backend decides what is actually on sale and at what price.
 */
export function getCurrentWave(now: Date = new Date()): SaleWave {
  const today = todayInLagos(now);
  return EVENT.waves.find((w) => w.endsOn === null || today <= w.endsOn) ?? EVENT.waves[EVENT.waves.length - 1];
}
