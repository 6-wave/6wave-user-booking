import { EventDetails } from "@/components/event/event-details";
import { FinalCta } from "@/components/event/final-cta";
import { Hero } from "@/components/event/hero";
import { KnowBeforeYouGo } from "@/components/event/know-before-you-go";

export default function Home() {
  return (
    <>
      <Hero />
      <EventDetails />
      <KnowBeforeYouGo />
      <FinalCta />
    </>
  );
}
