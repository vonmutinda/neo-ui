import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useAdminConfig,
  useAdminUpdateConfig,
  useAdminRules,
  useAdminRule,
  useAdminCreateRule,
  useAdminUpdateRule,
  useAdminComplianceReport,
} from "../use-admin-config";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
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

describe("useAdminConfig", () => {
  it("calls GET /config", async () => {
    globalThis.fetch = mockFetchSuccess([
      { key: "registrations_enabled", value: true },
    ]);

    const { result } = renderHook(() => useAdminConfig(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/config");
  });
});

describe("useAdminUpdateConfig", () => {
  it("calls PATCH /config with entries", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminUpdateConfig(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      entries: [{ key: "registrations_enabled", value: false }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "PATCH", "/config");
    expectAdminCallBody(globalThis.fetch, {
      entries: [{ key: "registrations_enabled", value: false }],
    });
  });
});

describe("useAdminRules", () => {
  it("calls GET /rules", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(() => useAdminRules(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/rules");
  });
});

describe("useAdminRule", () => {
  it("calls GET /rules/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "r1", key: "daily_limit" });

    const { result } = renderHook(() => useAdminRule("r1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/rules/r1");
  });
});

describe("useAdminCreateRule", () => {
  it("calls POST /rules with rule data", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "r2" });

    const { result } = renderHook(() => useAdminCreateRule(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      key: "new_rule",
      scope: "global",
      valueType: "amount_cents",
      value: "100000",
      effectiveFrom: "2026-03-01",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/rules");
    expectAdminCallBody(globalThis.fetch, {
      key: "new_rule",
      scope: "global",
      valueType: "amount_cents",
      value: "100000",
      effectiveFrom: "2026-03-01",
    });
  });
});

describe("useAdminUpdateRule", () => {
  it("calls PATCH /rules/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "r1" });

    const { result } = renderHook(() => useAdminUpdateRule(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "r1", value: "200000" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "PATCH", "/rules/r1");
    expectAdminCallBody(globalThis.fetch, { value: "200000" });
  });
});

describe("useAdminComplianceReport", () => {
  it("calls GET /compliance/report", async () => {
    globalThis.fetch = mockFetchSuccess({
      generatedAt: "2026-02-17T00:00:00Z",
      rules: [],
      violations: [],
    });

    const { result } = renderHook(() => useAdminComplianceReport(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/compliance/report");
  });
});
