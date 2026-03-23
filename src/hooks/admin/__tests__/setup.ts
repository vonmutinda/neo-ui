import { vi, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import type { AdminStaff } from "@/lib/admin-types";

const API_URL = "http://localhost:8080";
const ADMIN_PREFIX = "/admin/v1";

export const TEST_TOKEN = "test-admin-jwt-token";
export const TEST_STAFF: AdminStaff = {
  id: "staff-uuid-1",
  email: "admin@enviar.et",
  fullName: "Test Admin",
  role: "super_admin",
  department: "Executive",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

export function setupAdminAuth() {
  useAdminAuthStore.getState().login(TEST_TOKEN, TEST_STAFF);
}

export function clearAdminAuth() {
  useAdminAuthStore.getState().logout();
}

export function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

export function mockFetchSuccess(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status,
    json: () => Promise.resolve({ data }),
    text: () => Promise.resolve(JSON.stringify({ data })),
    headers: new Headers(),
  });
}

export function mockFetchPaginated(
  data: unknown[],
  total: number,
  limit = 20,
  offset = 0,
) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        data,
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      }),
    text: () => Promise.resolve(JSON.stringify({ data })),
    headers: new Headers(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMock = any;

export function expectAdminCall(
  fetchMock: AnyMock,
  method: string,
  path: string,
) {
  expect(fetchMock).toHaveBeenCalled();
  const [url, opts] = fetchMock.mock.calls[0];
  expect(url).toBe(`${API_URL}${ADMIN_PREFIX}${path}`);
  expect(opts.method).toBe(method);
  expect(opts.headers.get("Authorization")).toBe(`Bearer ${TEST_TOKEN}`);
  expect(opts.headers.get("Content-Type")).toBe("application/json");
  expect(opts.headers.get("X-Request-Id")).toBeTruthy();
}

export function expectAdminCallBody(fetchMock: AnyMock, expectedBody: unknown) {
  const [, opts] = fetchMock.mock.calls[0];
  expect(JSON.parse(opts.body)).toEqual(expectedBody);
}

export { renderHook, waitFor };
