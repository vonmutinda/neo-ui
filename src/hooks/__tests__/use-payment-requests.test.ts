import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useSentRequests,
  useReceivedRequests,
  usePendingRequestCount,
  usePaymentRequest,
  useCreatePaymentRequest,
  usePayRequest,
  useDeclineRequest,
  useCancelRequest,
  useRemindRequest,
} from "../use-payment-requests";
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

describe("useSentRequests", () => {
  it("calls GET /v1/payment-requests/sent with pagination", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(() => useSentRequests(10, 5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      "/v1/payment-requests/sent?limit=10&offset=5",
    );
  });
});

describe("useReceivedRequests", () => {
  it("calls GET /v1/payment-requests/received with defaults", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(() => useReceivedRequests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      "/v1/payment-requests/received?limit=20&offset=0",
    );
  });
});

describe("usePendingRequestCount", () => {
  it("calls GET /v1/payment-requests/received/count", async () => {
    globalThis.fetch = mockFetchSuccess({ count: 3 });

    const { result } = renderHook(() => usePendingRequestCount(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      "/v1/payment-requests/received/count",
    );
    expect(result.current.data).toEqual({ count: 3 });
  });
});

describe("usePaymentRequest", () => {
  it("calls GET /v1/payment-requests/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "pr1",
      status: "pending",
      amountCents: 50000,
    });

    const { result } = renderHook(() => usePaymentRequest("pr1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/payment-requests/pr1");
  });

  it("does not fire when id is empty", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => usePaymentRequest(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useCreatePaymentRequest", () => {
  it("calls POST /v1/payment-requests with correct body", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "pr2", status: "pending" });

    const { result } = renderHook(() => useCreatePaymentRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      recipient: "+251911223344",
      amountCents: 100000,
      currencyCode: "ETB",
      narration: "Lunch money",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/payment-requests");
    expectApiCallBody(globalThis.fetch, {
      recipient: "+251911223344",
      amountCents: 100000,
      currencyCode: "ETB",
      narration: "Lunch money",
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("usePayRequest", () => {
  it("calls POST /v1/payment-requests/{id}/pay", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => usePayRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("pr1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/payment-requests/pr1/pay");
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useDeclineRequest", () => {
  it("calls POST /v1/payment-requests/{id}/decline with reason", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useDeclineRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "pr1", body: { reason: "Not agreed upon" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      "/v1/payment-requests/pr1/decline",
    );
    expectApiCallBody(globalThis.fetch, { reason: "Not agreed upon" });
    expectIdempotencyKey(globalThis.fetch);
  });

  it("calls decline without reason", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useDeclineRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "pr1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      "/v1/payment-requests/pr1/decline",
    );
    expectApiCallBody(globalThis.fetch, {});
  });
});

describe("useCancelRequest", () => {
  it("calls DELETE /v1/payment-requests/{id}", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useCancelRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("pr1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "DELETE", "/v1/payment-requests/pr1");
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useRemindRequest", () => {
  it("calls POST /v1/payment-requests/{id}/remind", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useRemindRequest(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("pr1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      "/v1/payment-requests/pr1/remind",
    );
    expectIdempotencyKey(globalThis.fetch);
  });
});
