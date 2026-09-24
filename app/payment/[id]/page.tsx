import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PaymentFlow } from "@/components/payment/payment-flow";

export const metadata: Metadata = { title: "Payment" };

export default async function PaymentPage(props: PageProps<"/payment/[id]">) {
  const { id } = await props.params;
  const { reference } = await props.searchParams;

  return (
    <PageShell>
      <Link
        href={`/registration/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> My registration
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-bold">Payment</h1>
      {/* `reference` is present when returning from a hosted checkout redirect. */}
      <PaymentFlow
        registrationId={id}
        initialReference={typeof reference === "string" ? reference : undefined}
      />
    </PageShell>
  );
}
