"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { Spinner } from "@/components/feedback/spinner";
import { Swap } from "@/components/feedback/swap";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { errorMessage } from "@/lib/api/client";
import { createRegistration } from "@/lib/api/registrations";
import { DEFAULT_OPTION_ID } from "@/lib/event";
import { sleep } from "@/lib/sleep";
import { PurchasePicker } from "./purchase-picker";
import {
  validateEmail,
  validateFullName,
  validatePhone,
  validateRegistration,
  type FieldErrors,
  type RegistrationField,
  type RegistrationValues,
} from "@/lib/validation/registration";

type Status = "idle" | "submitting" | "success";

const FIELD_VALIDATORS: Record<
  RegistrationField,
  (value: string) => string | undefined
> = {
  fullName: validateFullName,
  phone: validatePhone,
  email: validateEmail,
};

const FIELD_ORDER: RegistrationField[] = ["fullName", "phone", "email"];

export function RegistrationForm({
  initialOptionId = DEFAULT_OPTION_ID,
}: {
  /** Preselected purchase, e.g. from a "Choose" link on the landing page. */
  initialOptionId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RegistrationValues>({
    optionId: initialOptionId,
    fullName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<FieldErrors<RegistrationField>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const busy = status !== "idle";

  function setField(field: RegistrationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    // Once a field is showing an error, re-check as they type so it clears
    // the moment it's fixed.
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: FIELD_VALIDATORS[field](value),
      }));
    }
  }

  function checkField(field: RegistrationField) {
    // Don't nag about a field they only tabbed through.
    if (!values[field]) return;
    setErrors((current) => ({
      ...current,
      [field]: FIELD_VALIDATORS[field](values[field]),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setServerError(null);

    const result = validateRegistration(values);
    if (!result.ok) {
      setErrors(result.errors);
      const firstInvalid = FIELD_ORDER.find((field) => result.errors[field]);
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const registration = await createRegistration(result.value);
      setStatus("success");
      // Let the success state register before moving on.
      await sleep(900);
      router.push(`/registration/${registration.id}/success`);
    } catch (error) {
      setStatus("idle");
      setServerError(errorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <PurchasePicker
        value={values.optionId}
        onChange={(optionId) => setValues((current) => ({ ...current, optionId }))}
        disabled={busy}
      />

      <FormField
        id="fullName"
        label="Full name"
        placeholder="e.g. George Omosigho"
        autoComplete="name"
        autoCapitalize="words"
        enterKeyHint="next"
        value={values.fullName}
        error={errors.fullName}
        disabled={busy}
        onChange={(e) => setField("fullName", e.target.value)}
        onBlur={() => checkField("fullName")}
      />
      <FormField
        id="phone"
        label="Phone number"
        type="tel"
        inputMode="tel"
        placeholder="0801 234 5678"
        autoComplete="tel"
        enterKeyHint="next"
        value={values.phone}
        error={errors.phone}
        hint="You'll use this to find your registration later."
        disabled={busy}
        onChange={(e) => setField("phone", e.target.value)}
        onBlur={() => checkField("phone")}
      />
      <FormField
        id="email"
        label="Email address"
        type="email"
        inputMode="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="go"
        value={values.email}
        error={errors.email}
        disabled={busy}
        onChange={(e) => setField("email", e.target.value)}
        onBlur={() => checkField("email")}
      />

      <FormError
        title="We couldn't complete your registration"
        message={serverError}
      />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={busy}
        aria-live="polite"
      >
        <Swap id={status}>
          {status === "submitting" ? (
            <>
              <Spinner /> Creating your registration…
            </>
          ) : status === "success" ? (
            <>
              <Check strokeWidth={3} /> You&apos;re registered!
            </>
          ) : (
            <>
              Register <ArrowRight />
            </>
          )}
        </Swap>
      </Button>
    </form>
  );
}
