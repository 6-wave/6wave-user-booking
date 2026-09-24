/** Base URL of the ASP.NET Core API. Public config only, never put secrets here. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please check your connection and try again.";
}

/**
 * Thin fetch wrapper for the real backend. The mock layer doesn't use it yet;
 * swapping a mock for a real call is a one-line change in lib/api/*.ts.
 */
export async function apiFetch<T>(
  path: string,
  init?: Omit<RequestInit, "body"> & { body?: unknown },
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 404
        ? "Not found"
        : "Something went wrong on our side. Please try again.",
      response.status,
    );
  }
  return (await response.json()) as T;
}
