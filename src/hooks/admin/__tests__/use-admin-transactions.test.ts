import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useAdminTransactions,
  useAdminTransaction,
  useAdminConversion,
  useAdminReverseTransaction,
} from "../use-admin-transactions";
import {
  setupAdminAuth,
  clearAdminAuth,
  createWrapper,
  mockFetchSuccess,
  mockFetchPaginated,
  expectAdminCall,
  expectAdminCallBody,
  renderHook,
  waitFor,
} from "./setup";

const originalFetch = globalThis.fetch;

beforeEach(() => setupAdminAuth());
afterEach(() => {
  clearAdminAuth();
  globalThis.fetch = originalFetch;
});

describe("useAdminTransactions", () => {
  it("calls GET /transactions with all filter params", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () =>
        useAdminTransactions({
          search: "ref123",
          type: "p2p_send",
          status: "completed",
          currency: "ETB",
          minAmountCents: 1000,
          maxAmountCents: 50000,
          limit: 50,
          offset: 0,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/transactions?search=ref123&type=p2p_send&status=completed&currency=ETB&min_amount=1000&max_amount=50000&limit=50&offset=0",
    );
  });
});

describe("useAdminTransaction", () => {
  it("calls GET /transactions/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "t1" });

    const { result } = renderHook(() => useAdminTransaction("t1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/transactions/t1");
  });
});

describe("useAdminConversion", () => {
  it("calls GET /transactions/{id}/conversion", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "t1",
      fromCurrency: "ETB",
      toCurrency: "USD",
      fromAmountCents: 50000,
      toAmountCents: 1000,
    });

    const { result } = renderHook(() => useAdminConversion("t1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/transactions/t1/conversion");
  });
});

describe("useAdminReverseTransaction", () => {
  it("calls POST /transactions/{id}/reverse with reason and ticket", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminReverseTransaction(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      id: "t1",
      reason: "Unauthorized",
      referenceTicket: "CS-001",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/transactions/t1/reverse");
    expectAdminCallBody(globalThis.fetch, {
      reason: "Unauthorized",
      referenceTicket: "CS-001",
    });
  });
});
