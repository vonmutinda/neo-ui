import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useAdminStaffList,
  useAdminStaffMember,
  useAdminCreateStaff,
  useAdminUpdateStaff,
  useAdminDeactivateStaff,
} from "../use-admin-staff";
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

describe("useAdminStaffList", () => {
  it("calls GET /staff with role filter", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminStaffList({ role: "customer_support", isActive: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/staff?role=customer_support&is_active=true");
  });
});

describe("useAdminStaffMember", () => {
  it("calls GET /staff/{id}", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "s1", email: "staff@neo.et" });

    const { result } = renderHook(() => useAdminStaffMember("s1"), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/staff/s1");
  });
});

describe("useAdminCreateStaff", () => {
  it("calls POST /staff with staff data", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "s2" });

    const { result } = renderHook(() => useAdminCreateStaff(), { wrapper: createWrapper() });
    result.current.mutate({
      email: "new@neo.et",
      fullName: "New Staff",
      role: "customer_support",
      department: "Operations",
      password: "securepass",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/staff");
    expectAdminCallBody(globalThis.fetch, {
      email: "new@neo.et",
      fullName: "New Staff",
      role: "customer_support",
      department: "Operations",
      password: "securepass",
    });
  });
});

describe("useAdminUpdateStaff", () => {
  it("calls PATCH /staff/{id} with updated fields", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "s1" });

    const { result } = renderHook(() => useAdminUpdateStaff(), { wrapper: createWrapper() });
    result.current.mutate({ id: "s1", role: "customer_support_lead" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "PATCH", "/staff/s1");
    expectAdminCallBody(globalThis.fetch, { role: "customer_support_lead" });
  });
});

describe("useAdminDeactivateStaff", () => {
  it("calls DELETE /staff/{id}", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminDeactivateStaff(), { wrapper: createWrapper() });
    result.current.mutate("s1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "DELETE", "/staff/s1");
  });
});
