import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/transactions",
}));

const mockTransactions = vi.fn();

vi.mock("@/hooks/admin/use-admin-transactions", () => ({
  useAdminTransactions: () => mockTransactions(),
}));

import TransactionsPage from "../(authenticated)/transactions/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockTransactions.mockReturnValue({ data: null, isLoading: false });
});

describe("TransactionsPage", () => {
  it("renders loading state without crashing", () => {
    mockTransactions.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(TransactionsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null data", () => {
    mockTransactions.mockReturnValue({ data: null, isLoading: false });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getByText("No transactions found")).toBeTruthy();
  });

  it("renders with empty paginated response", () => {
    mockTransactions.mockReturnValue({
      data: { data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getByText("No transactions found")).toBeTruthy();
  });

  it("renders transactions with null fields", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [
          {
            id: null,
            userId: null,
            type: "p2p_send",
            amountCents: null,
            currency: "ETB",
            status: "completed",
            counterpartyName: null,
            counterpartyPhone: null,
            createdAt: "2026-01-15T10:00:00Z",
          },
          {
            id: "tx-abcdef123456789",
            userId: "user-xyz",
            type: "card_purchase",
            amountCents: 15000,
            currency: "USD",
            status: "completed",
            counterpartyName: "Amazon",
            createdAt: "2026-01-15T11:00:00Z",
          },
        ],
        pagination: { total: 2, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    const { container } = render(createElement(TransactionsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders pagination controls", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [{ id: "tx1", type: "p2p_send", amountCents: 1000, currency: "ETB", status: "completed", createdAt: "2026-01-15T10:00:00Z" }],
        pagination: { total: 50, limit: 20, offset: 0, hasMore: true },
      },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getByText(/Showing 1–20 of 50/)).toBeTruthy();
  });

  it("renders human-readable type labels", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [
          {
            id: "tx1",
            type: "p2p_send",
            amountCents: 1000,
            currency: "ETB",
            status: "completed",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getAllByText("P2P Send").length).toBeGreaterThan(0);
  });

  it("renders user column with link to customer detail", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [
          {
            id: "tx1",
            userId: "user-abc-123",
            type: "p2p_send",
            amountCents: 1000,
            currency: "ETB",
            status: "completed",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    const link = screen.getByRole("link", { name: /user-abc-123/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/admin/customers/user-abc-123");
  });

  it("shows counterparty name when available", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [
          {
            id: "tx1",
            type: "p2p_send",
            amountCents: 1000,
            currency: "ETB",
            status: "completed",
            counterpartyName: "John Doe",
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  it("renders FX conversion as single row with arrow notation", () => {
    mockTransactions.mockReturnValue({
      data: {
        data: [
          {
            id: "tx-conv-1",
            userId: "user-1",
            type: "convert_out",
            amountCents: 50000,
            currency: "ETB",
            status: "completed",
            convertedCurrency: "USD",
            convertedAmountCents: 1000,
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(TransactionsPage), { wrapper });
    expect(screen.getAllByText("FX Conversion").length).toBeGreaterThan(0);
    expect(screen.getByText(/ETB → USD/)).toBeTruthy();
  });

  it("renders convert_out in filter dropdown", () => {
    mockTransactions.mockReturnValue({ data: null, isLoading: false });
    const { container } = render(createElement(TransactionsPage), { wrapper });
    const options = container.querySelectorAll("option");
    const optionTexts = Array.from(options).map((o) => o.textContent);
    expect(optionTexts).toContain("FX Conversion");
  });
});
