import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { createElement, Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/loans/loan1",
}));

const mockLoanDetail = vi.fn();
const mockRepayLoan = vi.fn();
const mockWalletSummary = vi.fn();

vi.mock("@/hooks/use-loans", () => ({
  useLoanDetail: () => mockLoanDetail(),
  useRepayLoan: () => ({
    mutate: mockRepayLoan,
    mutateAsync: mockRepayLoan,
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-wallets", () => ({
  useWalletSummary: () => mockWalletSummary(),
}));

import LoanDetailPage from "../[id]/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

async function renderPage() {
  const paramsPromise = Promise.resolve({ id: "loan1" });
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      createElement(
        Suspense,
        { fallback: createElement("div", null, "loading") },
        createElement(LoanDetailPage, { params: paramsPromise }),
      ),
      { wrapper },
    );
  });
  return result!;
}

beforeEach(() => {
  mockLoanDetail.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
  });
  mockWalletSummary.mockReturnValue({
    data: null,
    isLoading: false,
  });
});

describe("LoanDetailPage", () => {
  it("renders loading skeletons", async () => {
    mockLoanDetail.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    const { container } = await renderPage();
    expect(container).toBeTruthy();
  });

  it("renders error state", async () => {
    mockLoanDetail.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    await renderPage();
    expect(screen.getByText("Could not load loan")).toBeTruthy();
  });

  it("renders active loan with Make Payment button", async () => {
    mockLoanDetail.mockReturnValue({
      data: {
        id: "loan1",
        principalAmountCents: 100000,
        interestFeeCents: 5000,
        totalDueCents: 105000,
        totalPaidCents: 30000,
        durationDays: 30,
        disbursedAt: "2026-01-15T00:00:00Z",
        dueDate: "2026-02-14T00:00:00Z",
        status: "active",
        daysPastDue: 0,
        progressPct: 29,
        remainingDisplay: "ETB 750.00",
        installments: [
          {
            installmentNumber: 1,
            amountDueCents: 52500,
            amountPaidCents: 30000,
            isPaid: false,
            dueDate: "2026-02-14T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getByText("Make payment")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
    expect(screen.getByText("29%")).toBeTruthy();
  });

  it("does not show Make Payment for repaid loans", async () => {
    mockLoanDetail.mockReturnValue({
      data: {
        id: "loan1",
        principalAmountCents: 100000,
        interestFeeCents: 5000,
        totalDueCents: 105000,
        totalPaidCents: 105000,
        durationDays: 30,
        disbursedAt: "2026-01-15T00:00:00Z",
        dueDate: "2026-02-14T00:00:00Z",
        status: "repaid",
        daysPastDue: 0,
        progressPct: 100,
        remainingDisplay: "ETB 0.00",
        installments: [
          {
            installmentNumber: 1,
            amountDueCents: 105000,
            amountPaidCents: 105000,
            isPaid: true,
            dueDate: "2026-02-14T00:00:00Z",
            paidAt: "2026-02-10T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getByText("Repaid")).toBeTruthy();
    expect(screen.queryByText("Make payment")).toBeNull();
  });

  it("shows past due warning for overdue loans", async () => {
    mockLoanDetail.mockReturnValue({
      data: {
        id: "loan1",
        principalAmountCents: 100000,
        interestFeeCents: 5000,
        totalDueCents: 105000,
        totalPaidCents: 0,
        durationDays: 30,
        disbursedAt: "2026-01-01T00:00:00Z",
        dueDate: "2026-01-31T00:00:00Z",
        status: "in_arrears",
        daysPastDue: 25,
        progressPct: 0,
        remainingDisplay: "ETB 1,050.00",
        installments: [],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getByText(/25 days past due/)).toBeTruthy();
    expect(screen.getByText("Make payment")).toBeTruthy();
  });

  it("links to repayment page from Make payment", async () => {
    mockLoanDetail.mockReturnValue({
      data: {
        id: "loan1",
        principalAmountCents: 100000,
        interestFeeCents: 5000,
        totalDueCents: 105000,
        totalPaidCents: 0,
        durationDays: 30,
        disbursedAt: "2026-01-15T00:00:00Z",
        dueDate: "2026-02-14T00:00:00Z",
        status: "active",
        daysPastDue: 0,
        progressPct: 0,
        remainingDisplay: "ETB 1,050.00",
        installments: [
          {
            installmentNumber: 1,
            amountDueCents: 105000,
            amountPaidCents: 0,
            isPaid: false,
            dueDate: "2026-02-14T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    const repayLink = screen.getByRole("link", { name: /make payment/i });
    expect(repayLink).toBeTruthy();
    expect(repayLink.getAttribute("href")).toBe("/loans/loan1/repay");
  });
});
