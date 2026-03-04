import { vi, expect } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { useAuthStore } from "@/providers/auth-store";

const API_URL = "http://localhost:8080";

export const TEST_TOKEN = "test-jwt-token";
export const TEST_USER_ID = "user-uuid-1";

export function setupAuth() {
  useAuthStore.getState().login(TEST_TOKEN, "refresh-token", TEST_USER_ID);
}

export function clearAuth() {
  useAuthStore.getState().logout();
}

export function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
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

export function mockFetchError(status: number, body: string) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve({ error: body }),
    text: () => Promise.resolve(body),
    headers: new Headers(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMock = any;

export function expectApiCall(
  fetchMock: AnyMock,
  method: string,
  path: string,
) {
  expect(fetchMock).toHaveBeenCalled();
  const [url, opts] = fetchMock.mock.calls[0];
  expect(url).toBe(`${API_URL}${path}`);
  expect(opts.method).toBe(method);
  expect(opts.headers.get("Authorization")).toBe(`Bearer ${TEST_TOKEN}`);
  expect(opts.headers.get("Content-Type")).toBe("application/json");
  expect(opts.headers.get("X-Request-Id")).toBeTruthy();
}

export function expectApiCallBody(
  fetchMock: AnyMock,
  expectedBody: unknown,
) {
  const [, opts] = fetchMock.mock.calls[0];
  expect(JSON.parse(opts.body)).toEqual(expectedBody);
}

export function expectIdempotencyKey(fetchMock: AnyMock) {
  const [, opts] = fetchMock.mock.calls[0];
  expect(opts.headers.get("Idempotency-Key")).toBeTruthy();
}

export { renderHook, waitFor };
