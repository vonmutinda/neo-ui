import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useInitiateTransfer } from "../use-initiate-transfer";
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

describe("useInitiateTransfer", () => {
  it("calls POST /transfers with correct body shape", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "txn-1", status: "pending" });

    const { result } = renderHook(() => useInitiateTransfer(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    const body = {
      type: "internal" as const,
      amountCents: 50000,
      currencyCode: "ETB" as const,
      recipientPhone: "+251911111111",
      recipientName: "Test User",
      narration: "Payment",
    };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/transfers`,
    );
    expectApiCallBody(globalThis.fetch, body);
    expectIdempotencyKey(globalThis.fetch);
  });

  it("sends type field NOT transferType", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "txn-2" });

    const { result } = renderHook(() => useInitiateTransfer(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      type: "external" as const,
      amountCents: 10000,
      currencyCode: "USD" as const,
      recipientBank: "CBE",
      recipientAccount: "1000123456",
      recipientName: "Bank Recipient",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [, opts] = (globalThis.fetch as ReturnType<typeof mockFetchSuccess>)
      .mock.calls[0];
    const parsed = JSON.parse(opts.body);
    expect(parsed).toHaveProperty("type");
    expect(parsed).not.toHaveProperty("transferType");
  });
});
