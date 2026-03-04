import { useAdminAuthStore } from "@/providers/admin-auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const ADMIN_PREFIX = "/admin/v1";
const REQUEST_TIMEOUT_MS = 15_000;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

class AdminApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Admin API ${status}: ${body}`);
    this.name = "AdminApiError";
  }
}

function uuid(): string {
  return crypto.randomUUID();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");
  headers.set("X-Request-Id", uuid());

  if (MUTATING_METHODS.has(method)) {
    headers.set("Idempotency-Key", uuid());
  }

  const token = useAdminAuthStore.getState().token;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const url = `${API_URL}${ADMIN_PREFIX}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...options, method, headers, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AdminApiError(0, "Request timed out");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401) {
    useAdminAuthStore.getState().logout();
    if (typeof window !== "undefined" && !path.startsWith("/auth/login")) {
      window.location.href = "/admin/login";
    }
    throw new AdminApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new AdminApiError(res.status, text);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (json && typeof json === "object" && "data" in json && !("pagination" in json)) {
    return json.data as T;
  }

  return json as T;
}

export const adminApi = {
  get<T>(path: string): Promise<T> {
    return request<T>(path);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
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

export { AdminApiError };
