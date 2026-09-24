"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import { Spinner } from "@/components/feedback/spinner";
import { Swap } from "@/components/feedback/swap";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { errorMessage, isNotFound } from "@/lib/api/client";
import { lookupRegistration } from "@/lib/api/registrations";
import { EVENT } from "@/lib/event";
import { sleep } from "@/lib/sleep";
import {
  validateLookup,
  validatePhone,
  validateReference,
  type FieldErrors,
  type LookupField,
  type LookupValues,
} from "@/lib/validation/registration";

type Status = "idle" | "searching" | "found";

const FIELD_VALIDATORS: Record<
  LookupField,
  (value: string) => string | undefined
> = {
  reference: validateReference,
  phone: validatePhone,
};

export function LookupForm() {
  const router = useRouter();
  const [values, setValues] = useState<LookupValues>({
    reference: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FieldErrors<LookupField>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [problem, setProblem] = useState<string | null>(null);

  const busy = status !== "idle";

  function setField(field: LookupField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: FIELD_VALIDATORS[field](value),
      }));
    }
  }

  function checkField(field: LookupField) {
    if (!values[field]) return;
    setErrors((current) => ({
      ...current,
      [field]: FIELD_VALIDATORS[field](values[field]),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setProblem(null);

    const result = validateLookup(values);
    if (!result.ok) {
      setErrors(result.errors);
      const firstInvalid = (["reference", "phone"] as const).find(
        (field) => result.errors[field],
      );
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    setErrors({});
    setStatus("searching");
    try {
      const registration = await lookupRegistration(result.value);
      setStatus("found");
      await sleep(700);
      router.push(`/registration/${registration.id}`);
    } catch (error) {
      setStatus("idle");
      setProblem(
        // Same message whichever detail was wrong, so this can't be used to
        // guess who is registered.
        isNotFound(error)
          ? "We couldn't find a registration with those details. Check the registration number and the phone number you registered with."
          : errorMessage(error),
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <FormField
        id="reference"
        label="Registration ID"
        placeholder={`${EVENT.referencePrefix}-83921`}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        enterKeyHint="next"
        className="font-mono tracking-wide uppercase placeholder:normal-case"
        value={values.reference}
        error={errors.reference}
        hint="It's on your registration success page."
        disabled={busy}
        onChange={(e) => setField("reference", e.target.value)}
        onBlur={() => checkField("reference")}
      />
      <FormField
        id="phone"
        label="Phone number"
        type="tel"
        inputMode="tel"
        placeholder="0801 234 5678"
        autoComplete="tel"
        enterKeyHint="search"
        value={values.phone}
        error={errors.phone}
        hint="The number you registered with."
        disabled={busy}
        onChange={(e) => setField("phone", e.target.value)}
        onBlur={() => checkField("phone")}
      />

      <FormError title="No registration found" message={problem} />

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        <Swap id={status}>
          {status === "searching" ? (
            <>
              <Spinner /> Searching…
            </>
          ) : status === "found" ? (
            <>
              <Check strokeWidth={3} /> Found it!
            </>
          ) : (
            <>
              <Search /> Find Registration
            </>
          )}
        </Swap>
      </Button>
    </form>
  );
}
