import type { EventInfo } from "@/types/event";

/**
 * Single source of truth for event details shown across the app.
 *
 * TODO(organizers): replace the date, time and venue placeholders below before
 * this goes in front of real participants, and confirm the age notice and the
 * "pay at the gate" wording.
 */
export const EVENT: EventInfo = {
  name: "Pool Party 2026",
  shortName: "Pool Party 2026",
  accentWord: "Party",
  tagline: "Make a splash!",
  description:
    "Lock in your spot in under a minute. Your personal QR code shows up straight away, and it's your way in on the night.",
  ageNote: "18+ only",
  referencePrefix: "POOL",
  date: "Date to be announced",
  time: "Time to be announced",
  location: "Venue to be announced",
  address: "Details will be shared with registered guests",
  feeNaira: 5000,
  knowBeforeYouGo: [
    {
      title: "Your QR is your ticket",
      body: "You get it the moment you register. Keep it on your phone or print it. You'll need it at the entrance.",
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
      title: "Arrive early",
      body: "The crowd all shows up at once, so give yourself extra time at the door.",
    },
  ],
};
