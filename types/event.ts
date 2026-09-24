export type TicketType = "REGULAR" | "VIP";

export interface TicketOption {
  type: TicketType;
  label: string;
  /** Price in Naira. The backend is the authority on what is actually charged. */
  priceNaira: number;
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
  organizer: string;
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
  /** Ticket tiers, cheapest first. */
  tickets: TicketOption[];
  /** Teaser tags from the flyer, e.g. "Hype policy: undisclosed". */
  teasers: { label: string; value: string }[];
  reservations: { display: string; tel: string }[];
  knowBeforeYouGo: { title: string; body: string }[];
}
