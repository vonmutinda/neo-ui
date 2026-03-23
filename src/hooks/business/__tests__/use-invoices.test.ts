import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useInvoices, useInvoiceSummary } from "../use-invoices";
import {
  setupAuth,
  clearAuth,
  createWrapper,
  mockFetchSuccess,
  expectApiCall,
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

describe("useInvoices", () => {
  it("calls GET /invoices with filter params", async () => {
    globalThis.fetch = mockFetchSuccess({ items: [], total: 0 });

    const { result } = renderHook(
      () => useInvoices(TEST_BUSINESS_ID, { status: "draft", limit: 20 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/invoices?status=draft&limit=20`,
    );
  });

  it("does not fire when bizId is null", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useInvoices(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useInvoiceSummary", () => {
  it("calls GET /invoices/summary", async () => {
    globalThis.fetch = mockFetchSuccess({
      totalDraft: 5,
      totalSent: 3,
      totalPaid: 10,
    });

    const { result } = renderHook(() => useInvoiceSummary(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/invoices/summary`,
    );
  });
});
