import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useBusinessMembers, useMyPermissions } from "../use-business-members";
import {
  setupAuth,
  clearAuth,
  createWrapper,
  mockFetchSuccess,
  expectApiCall,
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

describe("useBusinessMembers", () => {
  it("calls GET /v1/business/{bizId}/members", async () => {
    globalThis.fetch = mockFetchSuccess([
      { id: "m1", userId: "u1", roleName: "Admin" },
    ]);

    const { result } = renderHook(() => useBusinessMembers(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/members`,
    );
  });

  it("is disabled when bizId is null", async () => {
    globalThis.fetch = mockFetchSuccess([]);

    const { result } = renderHook(() => useBusinessMembers(null), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.fetchStatus).toBe("idle"));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe("useMyPermissions", () => {
  it("calls GET /v1/business/{bizId}/members/me/permissions and extracts permissions array", async () => {
    globalThis.fetch = mockFetchSuccess({
      permissions: [
        "biz:dashboard:view",
        "biz:transfers:create",
        "biz:transfers:approve",
      ],
    });

    const { result } = renderHook(() => useMyPermissions(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "GET",
      `/v1/business/${TEST_BUSINESS_ID}/members/me/permissions`,
    );
    expect(result.current.data).toEqual([
      "biz:dashboard:view",
      "biz:transfers:create",
      "biz:transfers:approve",
    ]);
  });
});
