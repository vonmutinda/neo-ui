import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useAdminLogin,
  useAdminChangePassword,
  useAdminMe,
} from "../use-admin-auth";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
  expectAdminCall,
  expectAdminCallBody,
  renderHook,
  waitFor,
  TEST_STAFF,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => {
  setupAdminAuth();
});

afterEach(() => {
  clearAdminAuth();
  globalThis.fetch = originalFetch;
});

describe("useAdminLogin", () => {
  it("calls POST /auth/login with email and password", async () => {
    const mockResponse = { token: "new-token", staff: TEST_STAFF };
    globalThis.fetch = mockFetchSuccess(mockResponse);

    const { result } = renderHook(() => useAdminLogin(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ email: "admin@enviar.et", password: "secret" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/auth/login");
    expectAdminCallBody(globalThis.fetch, {
      email: "admin@enviar.et",
      password: "secret",
    });
  });
});

describe("useAdminChangePassword", () => {
  it("calls POST /auth/change-password", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminChangePassword(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ currentPassword: "old", newPassword: "new" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/auth/change-password");
    expectAdminCallBody(globalThis.fetch, {
      currentPassword: "old",
      newPassword: "new",
    });
  });
});

describe("useAdminMe", () => {
  it("calls GET /staff/me with auth header", async () => {
    globalThis.fetch = mockFetchSuccess(TEST_STAFF);

    const { result } = renderHook(() => useAdminMe(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/staff/me");
  });
});
