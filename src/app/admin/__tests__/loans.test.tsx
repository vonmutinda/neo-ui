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
  usePathname: () => "/admin/loans",
}));

const mockLoans = vi.fn();
const mockLoanSummary = vi.fn();

vi.mock("@/hooks/admin/use-admin-loans", () => ({
  useAdminLoans: () => mockLoans(),
  useAdminLoanSummary: () => mockLoanSummary(),
}));

import LoansPage from "../(authenticated)/loans/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockLoans.mockReturnValue({ data: null, isLoading: false });
  mockLoanSummary.mockReturnValue({ data: null, isLoading: false });
});

describe("LoansPage", () => {
  it("renders loading state without crashing", () => {
    mockLoans.mockReturnValue({ data: null, isLoading: true });
    mockLoanSummary.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(LoansPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null data", () => {
    render(createElement(LoansPage), { wrapper });
    expect(screen.getByText("No loans found")).toBeTruthy();
  });

  it("renders with empty paginated response", () => {
    mockLoans.mockReturnValue({
      data: { data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } },
      isLoading: false,
    });
    render(createElement(LoansPage), { wrapper });
    expect(screen.getByText("No loans found")).toBeTruthy();
  });

  it("renders loans with null numeric fields", () => {
    mockLoans.mockReturnValue({
      data: {
        data: [
          {
            id: null,
            userId: null,
            principalAmountCents: null,
            totalDueCents: null,
            totalPaidCents: null,
            status: "active",
            dueDate: "2026-06-01T00:00:00Z",
            daysPastDue: 0,
          },
          {
            id: "loan-abcdefgh",
            userId: "user-12345678",
            principalAmountCents: 100000,
            totalDueCents: 110000,
            totalPaidCents: 50000,
            status: "active",
            dueDate: "2026-06-01T00:00:00Z",
            daysPastDue: 5,
          },
        ],
        pagination: { total: 2, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    const { container } = render(createElement(LoansPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders loan summary with null values", () => {
    mockLoanSummary.mockReturnValue({
      data: {
        totalDisbursedCents: null,
        totalOutstandingCents: null,
        portfolioAtRiskPercent: null,
        totalLoansIssued: null,
      },
      isLoading: false,
    });
    render(createElement(LoansPage), { wrapper });
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders loan summary with populated values", () => {
    mockLoanSummary.mockReturnValue({
      data: {
        totalDisbursedCents: 5000000,
        totalOutstandingCents: 2000000,
        portfolioAtRiskPercent: 3.5,
        totalLoansIssued: 150,
      },
      isLoading: false,
    });
    render(createElement(LoansPage), { wrapper });
    expect(screen.getByText("150")).toBeTruthy();
  });
});
