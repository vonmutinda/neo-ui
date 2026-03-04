import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useAdminCards,
  useAdminCard,
  useAdminCardAuthorizations,
  useAdminFreezeCard,
  useAdminUnfreezeCard,
  useAdminCancelCard,
  useAdminUpdateCardLimits,
} from "../use-admin-cards";
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

describe("useAdminCards", () => {
  it("calls GET /cards with type and status filters", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminCards({ type: "virtual", status: "active", limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/cards?type=virtual&status=active&limit=20&offset=0");
  });
});

describe("useAdminCard", () => {
  it("calls GET /cards/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "c1", lastFour: "1234" });

    const { result } = renderHook(() => useAdminCard("c1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/cards/c1");
  });
});

describe("useAdminCardAuthorizations", () => {
  it("calls GET /cards/{id}/authorizations with pagination", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminCardAuthorizations("c1", { limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/cards/c1/authorizations?limit=20&offset=0");
  });
});

describe("useAdminFreezeCard", () => {
  it("calls POST /cards/{id}/freeze", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminFreezeCard(), { wrapper: createWrapper() });
    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/cards/c1/freeze");
  });
});

describe("useAdminUnfreezeCard", () => {
  it("calls POST /cards/{id}/unfreeze", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminUnfreezeCard(), { wrapper: createWrapper() });
    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/cards/c1/unfreeze");
  });
});

describe("useAdminCancelCard", () => {
  it("calls POST /cards/{id}/cancel", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminCancelCard(), { wrapper: createWrapper() });
    result.current.mutate("c1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/cards/c1/cancel");
  });
});

describe("useAdminUpdateCardLimits", () => {
  it("calls PATCH /cards/{id}/limits", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminUpdateCardLimits(), { wrapper: createWrapper() });
    result.current.mutate({ id: "c1", dailyLimitCents: 5000000 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "PATCH", "/cards/c1/limits");
    expectAdminCallBody(globalThis.fetch, { dailyLimitCents: 5000000 });
  });
});
