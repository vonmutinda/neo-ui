import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAdminOverview } from "../use-admin-analytics";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
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

describe("useAdminOverview", () => {
  it("calls GET /analytics/overview", async () => {
    globalThis.fetch = mockFetchSuccess({ totalCustomers: 15420 });

    const { result } = renderHook(() => useAdminOverview(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/analytics/overview");
  });
});
