import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useCreateBatchPaymentRequest } from "../use-payment-requests";
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

describe("useCreateBatchPaymentRequest", () => {
  it("calls POST /v1/payment-requests/batch with correct body", async () => {
    globalThis.fetch = mockFetchSuccess({
      requests: [],
      totalAmountCents: 300000,
      recipientCount: 3,
    });

    const { result } = renderHook(() => useCreateBatchPaymentRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      totalAmountCents: 300000,
      currencyCode: "ETB",
      narration: "Dinner split",
      recipients: ["+251911111111", "+251922222222", "+251933333333"],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/payment-requests/batch");
    expectApiCallBody(globalThis.fetch, {
      totalAmountCents: 300000,
      currencyCode: "ETB",
      narration: "Dinner split",
      recipients: ["+251911111111", "+251922222222", "+251933333333"],
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});
