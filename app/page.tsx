import { EventDetails } from "@/components/event/event-details";
import { FinalCta } from "@/components/event/final-cta";
import { Hero } from "@/components/event/hero";
import { KnowBeforeYouGo } from "@/components/event/know-before-you-go";
import { TicketsAndTables } from "@/components/event/tickets-and-tables";

/** The page is pre-built, so refresh it hourly to keep "current wave" correct. */
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <EventDetails />
      <TicketsAndTables />
      <KnowBeforeYouGo />
      <FinalCta />
    </>
  );
}
