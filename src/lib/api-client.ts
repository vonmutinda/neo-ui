import { useAuthStore } from "@/providers/auth-store";
import { toast } from "sonner";

// Normalize typo "htts" -> "https" so requests and CSP match
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_URL = rawApiUrl.replace(/^htts:\/\//i, "https://");
const REQUEST_TIMEOUT_MS = 15_000;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function uuid(): string {
  return crypto.randomUUID();
}

class ApiClientError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`API ${status}: ${body}`);
    this.name = "ApiClientError";
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;

      const json = await res.json();
      const data = json?.data ?? json;
      if (data?.accessToken && data?.refreshToken) {
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set("X-Request-Id", uuid());

  if (MUTATING_METHODS.has(method)) {
    headers.set("Idempotency-Key", uuid());
  }

  const token = useAuthStore.getState().token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const url = `${API_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      method,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError(0, "Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 409 && MUTATING_METHODS.has(method)) {
    const body = await res.json();
    if (body && typeof body === "object" && "data" in body) {
      return body.data as T;
    }
    return body as T;
  }

  if (res.status === 401) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      return request<T>(path, options);
    }
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      toast.error("Session expired. Please log in again.");
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiClientError(401, "Unauthorized");
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
    await sleep(delayMs);
    return request<T>(path, options);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiClientError(res.status, text);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (json && typeof json === "object" && "data" in json) {
    return json.data as T;
  }

  return json as T;
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: "DELETE" });
  },
};

export { ApiClientError };

export function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, options);
}
