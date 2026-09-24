import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { RegistrationForm } from "@/components/registration/registration-form";
import { ClubBanner } from "@/components/illustrations/club-banner";
import { Reveal } from "@/components/motion/reveal";
import { EVENT, LOWEST_PRICE } from "@/lib/event";
import { formatNaira } from "@/lib/format";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <PageShell>
      <div>
        <Reveal delay={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back
          </Link>
        </Reveal>

        <Reveal delay={0.06} className="mt-4">
          <ClubBanner
            title="Register"
            pill={`From ${formatNaira(LOWEST_PRICE)}`}
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-5 text-muted-foreground">
          {EVENT.name}: {EVENT.subtitle}. {EVENT.date}, {EVENT.time} at{" "}
          {EVENT.venue}. Your QR code is created as soon as you register, and
          you can pay right after.
        </Reveal>

        <Reveal delay={0.16} className="mt-6 card-pop rounded-3xl p-5 sm:p-6">
          <RegistrationForm />
        </Reveal>

        <Reveal delay={0.22} className="mt-6 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link
            href="/lookup"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Find my registration
          </Link>
        </Reveal>
      </div>
    </PageShell>
  );
}
