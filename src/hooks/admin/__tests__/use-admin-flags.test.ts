import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAdminFlags, useAdminCreateFlag, useAdminResolveFlag } from "../use-admin-flags";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
  mockFetchPaginated,
  expectAdminCall,
  expectAdminCallBody,
  renderHook,
  waitFor,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAdminAuth());
afterEach(() => {
  clearAdminAuth();
  globalThis.fetch = originalFetch;
});

describe("useAdminFlags", () => {
  it("calls GET /flags with severity filter", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminFlags({ severity: "critical", isResolved: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/flags?severity=critical&is_resolved=false");
  });
});

describe("useAdminCreateFlag", () => {
  it("calls POST /flags with flag data", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "f1" });

    const { result } = renderHook(() => useAdminCreateFlag(), { wrapper: createWrapper() });
    result.current.mutate({
      userId: "u1",
      flagType: "suspicious_activity",
      severity: "warning",
      description: "Multiple failed transfers",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/flags");
    expectAdminCallBody(globalThis.fetch, {
      userId: "u1",
      flagType: "suspicious_activity",
      severity: "warning",
      description: "Multiple failed transfers",
    });
  });
});

describe("useAdminResolveFlag", () => {
  it("calls POST /flags/{id}/resolve with note", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminResolveFlag(), { wrapper: createWrapper() });
    result.current.mutate({ id: "f1", resolutionNote: "Verified legitimate activity" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/flags/f1/resolve");
    expectAdminCallBody(globalThis.fetch, { resolutionNote: "Verified legitimate activity" });
  });
});
