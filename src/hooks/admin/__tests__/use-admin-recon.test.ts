import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useAdminReconRuns,
  useAdminReconExceptions,
  useAdminAssignException,
  useAdminInvestigateException,
  useAdminResolveException,
  useAdminEscalateException,
} from "../use-admin-recon";
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

describe("useAdminReconRuns", () => {
  it("calls GET /reconciliation/runs with pagination", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminReconRuns({ limit: 20, offset: 0 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "GET", "/reconciliation/runs?limit=20&offset=0");
  });
});

describe("useAdminReconExceptions", () => {
  it("calls GET /reconciliation/exceptions with filters", async () => {
    globalThis.fetch = mockFetchPaginated([], 0);

    const { result } = renderHook(
      () => useAdminReconExceptions({ status: "open", errorType: "amount_mismatch" }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(
      globalThis.fetch,
      "GET",
      "/reconciliation/exceptions?status=open&error_type=amount_mismatch",
    );
  });
});

describe("useAdminAssignException", () => {
  it("calls POST /reconciliation/exceptions/{id}/assign", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminAssignException(), { wrapper: createWrapper() });
    result.current.mutate({ id: "e1", assignedTo: "staff-uuid" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/reconciliation/exceptions/e1/assign");
    expectAdminCallBody(globalThis.fetch, { assignedTo: "staff-uuid" });
  });
});

describe("useAdminInvestigateException", () => {
  it("calls POST /reconciliation/exceptions/{id}/investigate", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminInvestigateException(), { wrapper: createWrapper() });
    result.current.mutate({ id: "e1", notes: "Looking into it" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/reconciliation/exceptions/e1/investigate");
  });
});

describe("useAdminResolveException", () => {
  it("calls POST /reconciliation/exceptions/{id}/resolve", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminResolveException(), { wrapper: createWrapper() });
    result.current.mutate({ id: "e1", resolutionNotes: "Fixed", resolutionAction: "manual_adjustment" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/reconciliation/exceptions/e1/resolve");
    expectAdminCallBody(globalThis.fetch, { resolutionNotes: "Fixed", resolutionAction: "manual_adjustment" });
  });
});

describe("useAdminEscalateException", () => {
  it("calls POST /reconciliation/exceptions/{id}/escalate", async () => {
    globalThis.fetch = mockFetchSuccess(null);

    const { result } = renderHook(() => useAdminEscalateException(), { wrapper: createWrapper() });
    result.current.mutate({ id: "e1", notes: "Needs manager review" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectAdminCall(globalThis.fetch, "POST", "/reconciliation/exceptions/e1/escalate");
    expectAdminCallBody(globalThis.fetch, { notes: "Needs manager review" });
  });
});
