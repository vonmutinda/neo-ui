import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useRecipients,
  useRecipient,
  useSearchRecipientsByBank,
  useSearchRecipientsByName,
  useToggleFavorite,
  useArchiveRecipient,
  useBanks,
  useCreateRecipient,
} from "../use-recipients";
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

describe("useRecipients", () => {
  it("calls GET /v1/recipients with default params", async () => {
    globalThis.fetch = mockFetchSuccess({ recipients: [], total: 0 });

    const { result } = renderHook(() => useRecipients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/recipients?limit=20&offset=0");
  });

  it("passes filter params", async () => {
    globalThis.fetch = mockFetchSuccess({ recipients: [], total: 0 });

    const { result } = renderHook(
      () => useRecipients({ q: "abebe", type: "neo_user", favorite: true, limit: 10, offset: 5 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      "/v1/recipients?q=abebe&type=neo_user&favorite=true&limit=10&offset=5",
    );
  });
});

describe("useRecipient", () => {
  it("calls GET /v1/recipients/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "r1", displayName: "Abebe" });

    const { result } = renderHook(() => useRecipient("r1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/recipients/r1");
  });

  it("does not fire when id is empty", async () => {
    globalThis.fetch = mockFetchSuccess({});

    const { result } = renderHook(() => useRecipient(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useSearchRecipientsByBank", () => {
  it("calls search endpoint with institution and account", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(
      () => useSearchRecipientsByBank("CBE", "100012"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      "/v1/recipients/search/bank?institution=CBE&account=100012",
    );
  });

  it("does not fire when account is too short", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(
      () => useSearchRecipientsByBank("CBE", "10"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useSearchRecipientsByName", () => {
  it("calls search endpoint with name query", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(
      () => useSearchRecipientsByName("abebe"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/recipients/search/name?q=abebe");
  });

  it("does not fire when name is too short", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(
      () => useSearchRecipientsByName("a"),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useToggleFavorite", () => {
  it("calls PATCH /v1/recipients/{id}/favorite", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useToggleFavorite(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({ id: "r1", isFavorite: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "PATCH", "/v1/recipients/r1/favorite");
    expectApiCallBody(globalThis.fetch, { isFavorite: true });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useArchiveRecipient", () => {
  it("calls DELETE /v1/recipients/{id}", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useArchiveRecipient(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("r1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "DELETE", "/v1/recipients/r1");
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useBanks", () => {
  it("calls GET /v1/banks", async () => {
    globalThis.fetch = mockFetchSuccess([
      { institutionCode: "CBE", name: "Commercial Bank of Ethiopia" },
    ]);

    const { result } = renderHook(() => useBanks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/banks");
    expect(result.current.data).toEqual([
      { institutionCode: "CBE", name: "Commercial Bank of Ethiopia" },
    ]);
  });
});

describe("useCreateRecipient", () => {
  it("calls POST /v1/recipients for neo_user", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "r1",
      type: "neo_user",
      displayName: "Abebe Bikila",
    });

    const { result } = renderHook(() => useCreateRecipient(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      type: "neo_user",
      identifier: "+251911223344",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/recipients");
    expectApiCallBody(globalThis.fetch, {
      type: "neo_user",
      identifier: "+251911223344",
    });
    expectIdempotencyKey(globalThis.fetch);
  });

  it("calls POST /v1/recipients for bank_account", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "r2",
      type: "bank_account",
      displayName: "CBE ****5678",
    });

    const { result } = renderHook(() => useCreateRecipient(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      type: "bank_account",
      institutionCode: "CBE",
      accountNumber: "1000123456",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/recipients");
    expectApiCallBody(globalThis.fetch, {
      type: "bank_account",
      institutionCode: "CBE",
      accountNumber: "1000123456",
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});
