export interface EventInfo {
  name: string;
  shortName: string;
  /** The word in `name` that gets the highlighted treatment in the hero. */
  accentWord: string;
  tagline: string;
  description: string;
  /** Short age notice shown as a badge, e.g. "18+ only". */
  ageNote: string;
  /** Prefix of registration numbers issued by the backend, e.g. "POOL" -> POOL-83921. */
  referencePrefix: string;
  /** Human-readable date, e.g. "Saturday, 14 November 2026". */
  date: string;
  time: string;
  location: string;
  address: string;
  /** Entry fee in Naira. */
  feeNaira: number;
  knowBeforeYouGo: { title: string; body: string }[];
}
