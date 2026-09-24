import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Reveal } from "@/components/motion/reveal";
import { LookupForm } from "@/components/registration/lookup-form";

export const metadata: Metadata = { title: "Find my registration" };

export default function LookupPage() {
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
          <h1 className="mt-4 text-3xl font-bold">Find My Registration</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your registration ID and phone number to see your QR code and
            payment status.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 card-pop rounded-3xl p-5 sm:p-6">
          <LookupForm />
        </Reveal>

        <Reveal delay={0.2} className="mt-5 text-center text-sm text-muted-foreground">
          Haven&apos;t registered yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Register now
          </Link>
        </Reveal>
      </div>
    </PageShell>
  );
}
