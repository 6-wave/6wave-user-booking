export type PurchaseKind = "TICKET" | "GROUP" | "TABLE";

/** Everything you can buy: a ticket, a group of five, or a table. */
export interface PurchaseOption {
  /** Stable ID sent to the backend, e.g. "vip" or "table-150k". */
  id: string;
  kind: PurchaseKind;
  /** Shown on badges and passes, e.g. "VIP", "Regular group", "Table ₦150k". */
  label: string;
  /** One line of explanation, e.g. "1 person" or "5 people · 5 QR codes". */
  description: string;
  /** Price in Naira for the wave on sale. The backend is the authority on what is actually charged. */
  priceNaira: number;
  /** How many QR codes (people) this purchase covers. */
  admits: number;
  /** VIP tickets, VIP groups and tables get the premium badge. */
  premium: boolean;
}

/** A phase of ticket sales (Wave 1, Wave 2, D Day). Display-only on the frontend. */
export interface SaleWave {
  id: string;
  label: string;
  /** Last day on sale, "YYYY-MM-DD" (Nigerian time), inclusive. Null for the last wave. */
  endsOn: string | null;
  /** The end date as written for people, e.g. "20 October". Null when it has no end. */
  endsLabel: string | null;
  /** Price in Naira per option ID. */
  prices: Record<string, number>;
}

export interface EventInfo {
  /** "Sound Wave" */
  name: string;
  /** "The Ember Prelude" */
  subtitle: string;
  /** Name used in page titles, receipts and the QR pass. */
  shortName: string;
  /** "AMG presents" */
  presenter: string;
  description: string;
  /** Prefix of registration numbers issued by the backend, e.g. "WAVE" -> WAVE-83921. */
  referencePrefix: string;
  /** Date as written for people, e.g. "31st October". */
  date: string;
  /** For the red date tag: "31ST" over "OCT". */
  dateTag: { day: string; month: string };
  time: string;
  timeLabel: string;
  venue: string;
  address: string;
  /** Everything on sale, in display order. Prices come from `waves`. */
  options: Omit<PurchaseOption, "priceNaira">[];
  /** Sale phases, in date order. The last one has no end date. */
  waves: SaleWave[];
  /** Teaser tags from the flyer, e.g. "Hype policy: undisclosed". */
  teasers: { label: string; value: string }[];
  reservations: { display: string; tel: string }[];
  /** Where to send a bank transfer, until online payment is ready. */
  payment: {
    bank: string;
    accountNumber: string;
    accountName: string;
    /** Receipts go here: shown as `display`, opened with `waNumber` (international, no +). */
    whatsapp: { display: string; waNumber: string };
  };
  knowBeforeYouGo: { title: string; body: string }[];
}
