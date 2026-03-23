import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useBusinessCards,
  useIssueCard,
  useFreezeCard,
  useUnfreezeCard,
} from "../use-business-cards";
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

describe("useBusinessCards", () => {
  it("calls GET /v1/business/{bizId}/cards", async () => {
    globalThis.fetch = mockFetchSuccess({ items: [], total: 0 });

    const { result } = renderHook(() => useBusinessCards(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/cards`,
    );
  });
});

describe("useIssueCard", () => {
  it("calls POST /v1/business/{bizId}/cards with memberId, label, cardType, spendLimitCents, periodType", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "card-1", status: "active" });

    const { result } = renderHook(() => useIssueCard(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    const body = {
      memberId: "member-1",
      label: "Marketing expenses",
      cardType: "virtual" as const,
      spendLimitCents: 10000000,
      periodType: "monthly" as const,
    };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/cards`,
    );
    expectApiCallBody(globalThis.fetch, body);
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useFreezeCard", () => {
  it("calls POST /v1/business/{bizId}/cards/{id}/freeze", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useFreezeCard(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("card-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/cards/card-1/freeze`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useUnfreezeCard", () => {
  it("calls POST /v1/business/{bizId}/cards/{id}/unfreeze", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useUnfreezeCard(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("card-2");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/cards/card-2/unfreeze`,
    );
    expectApiCallBody(globalThis.fetch, {});
    expectIdempotencyKey(globalThis.fetch);
  });
});
