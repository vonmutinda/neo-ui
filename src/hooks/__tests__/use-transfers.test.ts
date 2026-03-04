import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useBatchTransfer } from "../use-transfers";
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

describe("useBatchTransfer", () => {
  it("calls POST /v1/transfers/batch with correct body", async () => {
    globalThis.fetch = mockFetchSuccess({
      status: "completed",
      receiptId: "r1",
      recipientCount: 2,
      totalCents: 200000,
      currency: "ETB",
    });

    const { result } = renderHook(() => useBatchTransfer(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      currency: "ETB",
      items: [
        { recipient: "+251911111111", amountCents: 100000, narration: "Split" },
        { recipient: "+251922222222", amountCents: 100000, narration: "Split" },
      ],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/transfers/batch");
    expectApiCallBody(globalThis.fetch, {
      currency: "ETB",
      items: [
        { recipient: "+251911111111", amountCents: 100000, narration: "Split" },
        { recipient: "+251922222222", amountCents: 100000, narration: "Split" },
      ],
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});
