import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useCreditScoreHistory } from "../use-loans";
import {
  setupAuth,
  clearAuth,
  createWrapper,
  mockFetchSuccess,
  expectApiCall,
  renderHook,
  waitFor,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAuth());
afterEach(() => {
  clearAuth();
  globalThis.fetch = originalFetch;
});

describe("useCreditScoreHistory", () => {
  it("calls GET /v1/loans/credit-score/history", async () => {
    globalThis.fetch = mockFetchSuccess({
      history: [
        { month: "2025-09", score: 450 },
        { month: "2025-10", score: 520 },
        { month: "2025-11", score: 580 },
        { month: "2025-12", score: 640 },
        { month: "2026-01", score: 690 },
        { month: "2026-02", score: 720 },
      ],
    });

    const { result } = renderHook(() => useCreditScoreHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/loans/credit-score/history");
    expect(result.current.data?.history).toHaveLength(6);
    expect(result.current.data?.history[5].score).toBe(720);
  });
});
