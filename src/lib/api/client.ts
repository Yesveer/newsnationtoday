/** Thin fetch wrapper around the Go API.
 *
 *  The access token lives in memory only — never localStorage — so a script on
 *  the page cannot walk off with it. The refresh token is an httpOnly cookie
 *  the browser handles for us, which is why every call sends credentials. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090/api/v1";

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Per-field messages from the API's validation errors. */
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Set false for login/refresh, which run before there is a token. */
  auth?: boolean;
  /** Internal: stops a refresh loop if the refreshed token is also rejected. */
  retrying?: boolean;
  signal?: AbortSignal;
}

async function parse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retrying = false, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  // An expired access token is routine — refresh once, then replay the call.
  if (response.status === 401 && auth && !retrying) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, retrying: true });
    }
  }

  const payload = await parse(response);
  if (!response.ok) {
    const error = (payload ?? {}) as { error?: string; message?: string; fields?: Record<string, string> };
    throw new ApiError(
      response.status,
      error.error ?? "request_failed",
      error.message ?? "Something went wrong",
      error.fields,
    );
  }
  return payload as T;
}

/** Uploads a file as multipart form data.
 *
 *  Kept separate from `apiFetch` because the browser has to set the multipart
 *  boundary itself — adding a Content-Type header here would break the body. */
export async function apiUpload<T>(path: string, form: FormData, retrying = false): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    credentials: "include",
    body: form,
  });

  if (response.status === 401 && !retrying) {
    const refreshed = await refreshSession();
    if (refreshed) return apiUpload<T>(path, form, true);
  }

  const payload = await parse(response);
  if (!response.ok) {
    const error = (payload ?? {}) as { error?: string; message?: string; fields?: Record<string, string> };
    throw new ApiError(
      response.status,
      error.error ?? "upload_failed",
      error.message ?? "The file could not be uploaded",
      error.fields,
    );
  }
  return payload as T;
}

/** Exchanges the refresh cookie for a new access token.
 *  Concurrent callers share one in-flight request. */
export function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        accessToken = null;
        return false;
      }
      const data = (await response.json()) as { accessToken?: string };
      if (!data.accessToken) {
        accessToken = null;
        return false;
      }
      accessToken = data.accessToken;
      return true;
    } catch {
      accessToken = null;
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
