import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useBeneficiaries,
  useCreateBeneficiary,
  useDeleteBeneficiary,
} from "../use-beneficiaries";
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

describe("useBeneficiaries", () => {
  it("calls GET /v1/beneficiaries", async () => {
    globalThis.fetch = mockFetchSuccess([
      { id: "b1", fullName: "Almaz Kebede", relationship: "spouse" },
    ]);

    const { result } = renderHook(() => useBeneficiaries(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "GET", "/v1/beneficiaries");
    expect(result.current.data).toEqual([
      { id: "b1", fullName: "Almaz Kebede", relationship: "spouse" },
    ]);
  });
});

describe("useCreateBeneficiary", () => {
  it("calls POST /v1/beneficiaries with correct body", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "b2",
      fullName: "Dawit Haile",
      relationship: "child",
    });

    const { result } = renderHook(() => useCreateBeneficiary(), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      fullName: "Dawit Haile",
      relationship: "child",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "POST", "/v1/beneficiaries");
    expectApiCallBody(globalThis.fetch, {
      fullName: "Dawit Haile",
      relationship: "child",
    });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useDeleteBeneficiary", () => {
  it("calls DELETE /v1/beneficiaries/{id}", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useDeleteBeneficiary(), {
      wrapper: createWrapper(),
    });
    result.current.mutate("b1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(globalThis.fetch, "DELETE", "/v1/beneficiaries/b1");
    expectIdempotencyKey(globalThis.fetch);
  });
});
