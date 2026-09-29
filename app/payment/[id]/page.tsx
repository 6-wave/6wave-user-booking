import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PaymentComingSoon } from "@/components/payment/payment-coming-soon";

export const metadata: Metadata = { title: "Payment" };

export default async function PaymentPage(props: PageProps<"/payment/[id]">) {
  const { id } = await props.params;

  return (
    <PageShell>
      <Link
        href={`/registration/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> My registration
      </Link>
      <h1 className="mt-4 mb-6 text-3xl font-bold">Payment</h1>
      <PaymentComingSoon />
    </PageShell>
  );
}
