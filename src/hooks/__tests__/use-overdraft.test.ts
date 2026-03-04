import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useOverdraft,
  useOverdraftOptIn,
  useOverdraftOptOut,
  useOverdraftRepay,
} from "../use-overdraft";
import {
  setupAuth,
  clearAuth,
  createWrapper,
  mockFetchSuccess,
  expectApiCall,
  expectApiCallBody,
  expectIdempotencyKey,
  renderHook,
  waitFor,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAuth());
afterEach(() => {
  clearAuth();
  globalThis.fetch = originalFetch;
});

describe("useOverdraft", () => {
  it("calls GET /v1/overdraft", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "od-1",
      userId: "user-1",
      limitCents: 50000,
      usedCents: 0,
      availableCents: 50000,
      status: "active",
      feeSummary: "No fee for the first 7 days.",
    });

    const { result } = renderHook(() => useOverdraft(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/overdraft");
    expect(result.current.data?.status).toBe("active");
    expect(result.current.data?.limitCents).toBe(50000);
  });
});

describe("useOverdraftOptIn", () => {
  it("calls POST /v1/overdraft/opt-in", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "od-1",
      status: "active",
      limitCents: 50000,
    });

    const { result } = renderHook(() => useOverdraftOptIn(), {
      wrapper: createWrapper(),
    });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/overdraft/opt-in");
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useOverdraftOptOut", () => {
  it("calls POST /v1/overdraft/opt-out", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 200);

    const { result } = renderHook(() => useOverdraftOptOut(), {
      wrapper: createWrapper(),
    });
    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/overdraft/opt-out");
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useOverdraftRepay", () => {
  it("calls POST /v1/overdraft/repay with amountCents", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 200);

    const { result } = renderHook(() => useOverdraftRepay(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ amountCents: 10000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/overdraft/repay");
    expectApiCallBody(globalThis.fetch, { amountCents: 10000 });
    expectIdempotencyKey(globalThis.fetch);
  });
});
