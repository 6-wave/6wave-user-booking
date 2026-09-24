import type { EventInfo, TicketOption, TicketType } from "@/types/event";

/**
 * Single source of truth for event details shown across the app. Taken from
 * the official flyer.
 *
 * Ticket prices (Regular ₦7,000, VIP ₦10,000) were confirmed by the organizers.
 * TODO(organizers): confirm the year (inferred as 2026).
 */
export const EVENT: EventInfo = {
  name: "Sound Wave",
  subtitle: "The Ember Prelude",
  shortName: "Sound Wave",
  presenter: "AMG presents",
  organizer: "6ixwave Entertainment",
  description:
    "Lock in your spot in under a minute. Your personal QR code shows up straight away, and it's your way in on the night.",
  referencePrefix: "WAVE",
  date: "31st October",
  dateTag: { day: "31ST", month: "OCT" },
  time: "8PM",
  timeLabel: "Main event",
  venue: "Jinos Lounge/Club",
  address: "5/7 Johnson Street, Onike, Sabo, Yaba.",
  tickets: [
    { type: "REGULAR", label: "Regular", priceNaira: 7000 },
    { type: "VIP", label: "VIP", priceNaira: 10000 },
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

export const DEFAULT_TICKET: TicketType = "REGULAR";

export function getTicket(type: TicketType): TicketOption {
  return EVENT.tickets.find((t) => t.type === type) ?? EVENT.tickets[0];
}

/** Lowest ticket price, for "From ₦7,000". */
export const LOWEST_PRICE = Math.min(...EVENT.tickets.map((t) => t.priceNaira));
