"use client";

import { useCallback, useEffect, useState } from "react";
import { errorMessage, isNotFound } from "@/lib/api/client";

export type ResourceState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "not-found" }
  | { status: "error"; message: string };

/**
 * Loads a value through a `lib/api` function. `load` must be stable
 * (wrap it in useCallback). A failed background refresh keeps the data that is
 * already on screen and only reports `refreshError`.
 */
export function useResource<T>(load: () => Promise<T>) {
  const [state, setState] = useState<ResourceState<T>>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (cancelled) return;
        setState({ status: "ready", data });
        setRefreshError(null);
        setRefreshing(false);
      },
      (error: unknown) => {
        if (cancelled) return;
        setRefreshing(false);
        setState((previous) => {
          if (previous.status === "ready") {
            setRefreshError(errorMessage(error));
            return previous;
          }
          return isNotFound(error)
            ? { status: "not-found" }
            : { status: "error", message: errorMessage(error) };
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  /** Re-fetch, keeping current data visible while it loads. */
  const refresh = useCallback(() => {
    setRefreshing(true);
    setAttempt((n) => n + 1);
  }, []);

  /** Start over from the loading state (used by "Try again"). */
  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { state, refreshing, refreshError, refresh, retry };
}
