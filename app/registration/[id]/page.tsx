import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { RegistrationStatus } from "@/components/registration/registration-status";

export const metadata: Metadata = { title: "My registration" };

export default async function RegistrationPage(
  props: PageProps<"/registration/[id]">,
) {
  const { id } = await props.params;
  return (
    <PageShell>
      <RegistrationStatus id={id} />
    </PageShell>
  );
}
