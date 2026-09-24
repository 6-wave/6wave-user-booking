import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { RegistrationSuccess } from "@/components/registration/registration-success";

export const metadata: Metadata = { title: "Registration successful" };

export default async function SuccessPage(
  props: PageProps<"/registration/[id]/success">,
) {
  const { id } = await props.params;
  return (
    <PageShell>
      <RegistrationSuccess id={id} />
    </PageShell>
  );
}
