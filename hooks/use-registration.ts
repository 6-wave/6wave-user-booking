"use client";

import { useCallback, useEffect } from "react";
import { getRegistration, getRegistrationQr } from "@/lib/api/registrations";
import { useResource } from "./use-resource";

export function useRegistration(
  id: string,
  { refreshOnFocus = false }: { refreshOnFocus?: boolean } = {},
) {
  const load = useCallback(() => getRegistration(id), [id]);
  const resource = useResource(load);
  const { refresh } = resource;

  // Staff can record a payment at the gate at any time, so re-check the
  // backend whenever the participant comes back to this tab.
  useEffect(() => {
    if (!refreshOnFocus) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshOnFocus, refresh]);

  return resource;
}

export function useRegistrationQr(id: string) {
  const load = useCallback(() => getRegistrationQr(id), [id]);
  return useResource(load);
}
