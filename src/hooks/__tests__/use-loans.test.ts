import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useLoanEligibility,
  useLoanHistory,
  useLoanDetail,
  useApplyLoan,
  useRepayLoan,
  useCreditScore,
} from "../use-loans";
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

describe("useLoanEligibility", () => {
  it("calls GET /v1/loans/eligibility", async () => {
    globalThis.fetch = mockFetchSuccess({
      isEligible: true,
      trustScore: 720,
      approvedLimitCents: 5000000,
    });

    const { result } = renderHook(() => useLoanEligibility(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/loans/eligibility");
    expect(result.current.data?.isEligible).toBe(true);
  });
});

describe("useLoanHistory", () => {
  it("calls GET /v1/loans with pagination", async () => {
    globalThis.fetch = mockFetchSuccess({
      loans: [],
      totalCount: 0,
      limit: 10,
      offset: 5,
      stats: {},
    });

    const { result } = renderHook(() => useLoanHistory(10, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/loans?limit=10&offset=5");
  });
});

describe("useLoanDetail", () => {
  it("calls GET /v1/loans/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "loan1",
      installments: [],
      progressPct: 50,
    });

    const { result } = renderHook(() => useLoanDetail("loan1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/loans/loan1");
  });

  it("does not fire when id is empty", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useLoanDetail(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useApplyLoan", () => {
  it("calls POST /v1/loans/apply with correct body", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "loan2", status: "active" });

    const { result } = renderHook(() => useApplyLoan(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ principalCents: 100000, durationDays: 30 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/loans/apply");
    expectApiCallBody(globalThis.fetch, {
      principalCents: 100000,
      durationDays: 30,
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useRepayLoan", () => {
  it("calls POST /v1/loans/{id}/repay with amount", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useRepayLoan(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "loan1", amountCents: 25000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/loans/loan1/repay");
    expectApiCallBody(globalThis.fetch, { amountCents: 25000 });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useCreditScore", () => {
  it("calls GET /v1/loans/credit-score", async () => {
    globalThis.fetch = mockFetchSuccess({
      trustScore: 720,
      maxScore: 1000,
      cashFlowPoints: 280,
      stabilityPoints: 140,
      penaltyPoints: 0,
      basePoints: 300,
      tips: ["Maintain regular deposits"],
    });

    const { result } = renderHook(() => useCreditScore(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/loans/credit-score");
    expect(result.current.data?.trustScore).toBe(720);
    expect(result.current.data?.tips).toHaveLength(1);
  });
});
