import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  useInviteMember,
  useUpdateMember,
  useRemoveMember,
} from "../use-manage-members";
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

describe("useInviteMember", () => {
  it("calls POST /v1/business/{bizId}/members with phoneNumber, roleId, title", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "m-new",
      userId: "u-new",
      roleName: "Accountant",
    });

    const { result } = renderHook(() => useInviteMember(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    const body = {
      phoneNumber: { countryCode: "+251", number: "911223344" },
      roleId: "role-accountant",
      title: "Senior Accountant",
    };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/members`,
    );
    expectApiCallBody(globalThis.fetch, body);
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useUpdateMember", () => {
  it("calls PATCH /v1/business/{bizId}/members/{id} with roleId", async () => {
    globalThis.fetch = mockFetchSuccess({
      id: "m-1",
      userId: "u-1",
      roleName: "Manager",
    });

    const { result } = renderHook(() => useUpdateMember(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate({
      memberId: "m-1",
      body: { roleId: "role-manager" },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "PATCH",
      `/v1/business/${TEST_BUSINESS_ID}/members/m-1`,
    );
    expectApiCallBody(globalThis.fetch, { roleId: "role-manager" });
    expectIdempotencyKey(globalThis.fetch);
  });
});

describe("useRemoveMember", () => {
  it("calls DELETE /v1/business/{bizId}/members/{id}", async () => {
    globalThis.fetch = mockFetchSuccess(undefined, 204);

    const { result } = renderHook(() => useRemoveMember(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });
    result.current.mutate("m-2");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "DELETE",
      `/v1/business/${TEST_BUSINESS_ID}/members/m-2`,
    );
    expectIdempotencyKey(globalThis.fetch);
  });
});
