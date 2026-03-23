import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useAdminLoans,
  useAdminLoanSummary,
  useAdminLoan,
  useAdminWriteOffLoan,
  useAdminCreditProfiles,
  useAdminCreditProfile,
  useAdminOverrideCredit,
} from "../use-admin-loans";
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

describe("useAdminLoans", () => {
  it("calls GET /loans with status filter", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminLoans({ status: "defaulted", limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/loans?status=defaulted&limit=20&offset=0",
    );
  });
});

describe("useAdminLoanSummary", () => {
  it("calls GET /loans/summary", async () => {
    globalThis.fetch = mockFetchSuccess({ totalLoansIssued: 100 });

    const { result } = renderHook(() => useAdminLoanSummary(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/loans/summary");
  });
});

describe("useAdminLoan", () => {
  it("calls GET /loans/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "l1", installments: [] });

    const { result } = renderHook(() => useAdminLoan("l1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/loans/l1");
  });
});

describe("useAdminWriteOffLoan", () => {
  it("calls POST /loans/{id}/write-off", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminWriteOffLoan(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      id: "l1",
      reason: "120 days past due",
      referenceTicket: "WO-001",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/loans/l1/write-off");
    expectAdminCallBody(globalThis.fetch, {
      reason: "120 days past due",
      referenceTicket: "WO-001",
    });
  });
});

describe("useAdminCreditProfiles", () => {
  it("calls GET /credit-profiles with pagination", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminCreditProfiles({ limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/credit-profiles?limit=20&offset=0",
    );
  });
});

describe("useAdminCreditProfile", () => {
  it("calls GET /credit-profiles/{userId}", async () => {
    globalThis.fetch = mockFetchSuccess({ userId: "u1", trustScore: 720 });

    const { result } = renderHook(() => useAdminCreditProfile("u1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/credit-profiles/u1");
  });
});

describe("useAdminOverrideCredit", () => {
  it("calls POST /credit-profiles/{userId}/override", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminOverrideCredit(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      userId: "u1",
      approvedLimitCents: 50000000,
      reason: "Manual upgrade",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/credit-profiles/u1/override");
    expectAdminCallBody(globalThis.fetch, {
      approvedLimitCents: 50000000,
      reason: "Manual upgrade",
    });
  });
});
