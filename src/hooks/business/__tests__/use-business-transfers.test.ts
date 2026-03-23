import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useBusinessTransfers,
  useApproveTransfer,
  useRejectTransfer,
} from "../use-business-transfers";
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
  TEST_BUSINESS_ID,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAuth());
afterEach(() => {
  clearAuth();
  globalThis.fetch = originalFetch;
});

describe("useBusinessTransfers", () => {
  it("calls GET with filter params", async () => {
    globalThis.fetch = mockFetchSuccess({ items: [], total: 0 });

    const { result } = renderHook(
      () =>
        useBusinessTransfers(TEST_BUSINESS_ID, {
          status: "pending",
          limit: 5,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/transfers?status=pending&limit=5`,
    );
  });

  it("does not fire when bizId is null", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useBusinessTransfers(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useApproveTransfer", () => {
  it("calls POST /transfers/{id}/approve with Idempotency-Key", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useApproveTransfer(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("t1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/transfers/t1/approve`,
    );
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useRejectTransfer", () => {
  it("calls POST /transfers/{id}/reject with reason", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useRejectTransfer(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ transferId: "t1", reason: "Duplicate payment" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/transfers/t1/reject`,
    );
    expectApiCallBody(globalThis.fetch, { reason: "Duplicate payment" });
    expectIdempotencyKey(globalThis.fetch);
  });
});
