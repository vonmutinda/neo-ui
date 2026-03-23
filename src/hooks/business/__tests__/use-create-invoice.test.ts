import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useCreateInvoice } from "../use-create-invoice";
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

describe("useCreateInvoice", () => {
  it("calls POST /invoices with correct body and Idempotency-Key", async () => {
    globalThis.fetch = mockFetchSuccess({ id: "inv-1", status: "draft" });

    const { result } = renderHook(() => useCreateInvoice(TEST_BUSINESS_ID), {
      wrapper: createWrapper(),
    });

    const body = {
      customerName: "Acme Corp",
      customerEmail: "billing@acme.com",
      currencyCode: "ETB" as const,
      subtotalCents: 100000,
      taxCents: 15000,
      totalCents: 115000,
      issueDate: "2026-03-01",
      dueDate: "2026-03-31",
      notes: "March services",
      lineItems: [
        {
          description: "Consulting",
          quantity: 10,
          unitPriceCents: 10000,
          totalCents: 100000,
          sortOrder: 0,
        },
      ],
    };
    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expectApiCall(
      globalThis.fetch,
      "POST",
      `/v1/business/${TEST_BUSINESS_ID}/invoices`,
    );
    expectApiCallBody(globalThis.fetch, body);
    expectIdempotencyKey(globalThis.fetch);
  });
});
