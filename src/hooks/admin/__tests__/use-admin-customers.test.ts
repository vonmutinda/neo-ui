import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useAdminCustomers,
  useAdminCustomer,
  useAdminCustomerFlags,
  useAdminFreezeCustomer,
  useAdminUnfreezeCustomer,
  useAdminKYCOverride,
  useAdminAddNote,
} from "../use-admin-customers";
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

describe("useAdminCustomers", () => {
  it("calls GET /customers with filter params", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminCustomers({ search: "0911", kycLevel: 2, isFrozen: false, limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/customers?search=0911&kyc_level=2&is_frozen=false&limit=20&offset=0",
    );
  });

  it("calls GET /customers with no params when filter is empty", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(() => useAdminCustomers({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/customers");
  });
});

describe("useAdminCustomer", () => {
  it("calls GET /customers/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ user: { id: "u1" } });

    const { result } = renderHook(() => useAdminCustomer("u1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/customers/u1");
  });
});

describe("useAdminCustomerFlags", () => {
  it("calls GET /customers/{id}/flags", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(() => useAdminCustomerFlags("u1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/customers/u1/flags");
  });
});

describe("useAdminFreezeCustomer", () => {
  it("calls POST /customers/{id}/freeze with reason", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminFreezeCustomer(), { wrapper: createWrapper() });
    result.current.mutate({ id: "u1", reason: "Suspicious activity" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/customers/u1/freeze");
    expectAdminCallBody(globalThis.fetch, { reason: "Suspicious activity" });
  });
});

describe("useAdminUnfreezeCustomer", () => {
  it("calls POST /customers/{id}/unfreeze", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminUnfreezeCustomer(), { wrapper: createWrapper() });
    result.current.mutate("u1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/customers/u1/unfreeze");
  });
});

describe("useAdminKYCOverride", () => {
  it("calls POST /customers/{id}/kyc-override with level and reason", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminKYCOverride(), { wrapper: createWrapper() });
    result.current.mutate({ id: "u1", kycLevel: 3, reason: "Manual upgrade" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/customers/u1/kyc-override");
    expectAdminCallBody(globalThis.fetch, { kycLevel: 3, reason: "Manual upgrade" });
  });
});

describe("useAdminAddNote", () => {
  it("calls POST /customers/{id}/note", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminAddNote(), { wrapper: createWrapper() });
    result.current.mutate({ id: "u1", note: "Called customer" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/customers/u1/note");
    expectAdminCallBody(globalThis.fetch, { note: "Called customer" });
  });
});
