import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useInvoiceDetail,
  useSendInvoice,
  useCancelInvoice,
  useRecordPayment,
} from "../use-invoice-detail";
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

describe("useInvoiceDetail", () => {
  it("calls GET /v1/business/{bizId}/invoices/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "inv-1", status: "draft" });

    const { result } = renderHook(
      () => useInvoiceDetail(TEST_BUSINESS_ID, "inv-1"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/invoices/inv-1`,
    );
  });

  it("is disabled when invoiceId is null", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(
      () => useInvoiceDetail(TEST_BUSINESS_ID, null),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useSendInvoice", () => {
  it("calls POST /v1/business/{bizId}/invoices/{id}/send", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useSendInvoice(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("inv-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/invoices/inv-1/send`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useCancelInvoice", () => {
  it("calls POST /v1/business/{bizId}/invoices/{id}/cancel", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useCancelInvoice(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("inv-2");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/invoices/inv-2/cancel`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useRecordPayment", () => {
  it("calls POST /v1/business/{bizId}/invoices/{id}/record-payment with amountCents", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useRecordPayment(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      invoiceId: "inv-3",
      body: { amountCents: 150000 },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/invoices/inv-3/record-payment`,
    );
    expectApiCallBody(globalThis.fetch, { amountCents: 150000 });
    expectIdempotencyKey(globalThis.fetch);
  });
});
