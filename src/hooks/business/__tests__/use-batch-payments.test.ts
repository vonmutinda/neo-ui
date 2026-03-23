import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useBatchPayments,
  useCreateBatchPayment,
  useApproveBatchPayment,
  useProcessBatchPayment,
} from "../use-batch-payments";
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

describe("useBatchPayments", () => {
  it("calls GET /v1/business/{bizId}/batch-payments", async () => {
    globalThis.fetch = mockFetchSuccess({ items: [], total: 0 });

    const { result } = renderHook(() => useBatchPayments(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/batch-payments`,
    );
  });

  it("passes filter params", async () => {
    globalThis.fetch = mockFetchSuccess({ items: [], total: 0 });

    const { result } = renderHook(
      () =>
        useBatchPayments(TEST_BUSINESS_ID, {
          status: "approved",
          limit: 25,
          offset: 5,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/batch-payments?status=approved&limit=25&offset=5`,
    );
  });
});

describe("useCreateBatchPayment", () => {
  it("calls POST /v1/business/{bizId}/batch-payments with name, currencyCode, items", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "batch-1", status: "draft" });

    const { result } = renderHook(
      () => useCreateBatchPayment(TEST_BUSINESS_ID),
      { wrapper: createWrapper() },
    );

    const body = {
      name: "March salaries",
      currencyCode: "ETB" as const,
      items: [
        {
          recipientName: "Abebe Bikila",
          recipientBank: "CBE",
          recipientAccount: "1000123456",
          amountCents: 5000000,
          narration: "March salary",
        },
      ],
    };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/batch-payments`,
    );
    expectApiCallBody(globalThis.fetch, body);
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useApproveBatchPayment", () => {
  it("calls POST /v1/business/{bizId}/batch-payments/{id}/approve", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(
      () => useApproveBatchPayment(TEST_BUSINESS_ID),
      { wrapper: createWrapper() },
    );
    result.current.mutate("batch-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/batch-payments/batch-1/approve`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useProcessBatchPayment", () => {
  it("calls POST /v1/business/{bizId}/batch-payments/{id}/process", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(
      () => useProcessBatchPayment(TEST_BUSINESS_ID),
      { wrapper: createWrapper() },
    );
    result.current.mutate("batch-2");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/batch-payments/batch-2/process`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});
