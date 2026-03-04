import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAdminAuditLog, useAdminAuditEntry } from "../use-admin-audit";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
  mockFetchPaginated,
  expectAdminCall,
  renderHook,
  waitFor,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAdminAuth());
afterEach(() => {
  clearAdminAuth();
  globalThis.fetch = originalFetch;
});

describe("useAdminAuditLog", () => {
  it("calls GET /audit with all filter params", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () =>
        useAdminAuditLog({
          action: "user_frozen",
          actorType: "admin",
          resourceType: "user",
          createdFrom: "2026-02-01",
          createdTo: "2026-02-17",
          limit: 50,
          offset: 0,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/audit?action=user_frozen&actor_type=admin&resource_type=user&from=2026-02-01&to=2026-02-17&limit=50&offset=0",
    );
  });
});

describe("useAdminAuditEntry", () => {
  it("calls GET /audit/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "a1", action: "user_frozen" });

    const { result } = renderHook(() => useAdminAuditEntry("a1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/audit/a1");
  });
});
