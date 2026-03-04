import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("framer-motion", () => ({
  motion: { div: (props: Record<string, unknown>) => createElement("div", props) },
  AnimatePresence: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

const mockOverview = vi.fn();
const mockFlags = vi.fn();
const mockExceptions = vi.fn();

vi.mock("@/hooks/admin/use-admin-analytics", () => ({
  useAdminOverview: () => mockOverview(),
}));

vi.mock("@/hooks/admin/use-admin-flags", () => ({
  useAdminFlags: () => mockFlags(),
}));

vi.mock("@/hooks/admin/use-admin-recon", () => ({
  useAdminReconExceptions: () => mockExceptions(),
}));

import AdminDashboardPage from "../(authenticated)/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockOverview.mockReturnValue({ data: null, isLoading: false });
  mockFlags.mockReturnValue({ data: null });
  mockExceptions.mockReturnValue({ data: null });
});

describe("AdminDashboardPage", () => {
  it("renders loading state without crashing", () => {
    mockOverview.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null overview data", () => {
    mockOverview.mockReturnValue({ data: null, isLoading: false });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders with populated overview data", () => {
    mockOverview.mockReturnValue({
      data: {
        totalCustomers: 1500,
        activeCustomers30d: 800,
        totalTransactions: 9500,
        openFlags: 7,
        activeLoans: 42,
        totalLoanOutstandingCents: 5000000,
        activeCards: 120,
        frozenAccounts: 3,
        pendingReconExceptions: 5,
        kycBreakdown: { "1": 500, "2": 700, "3": 300 },
      },
      isLoading: false,
    });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getByText("1,500")).toBeTruthy();
  });

  it("renders totalTransactions and openFlags from overview", () => {
    mockOverview.mockReturnValue({
      data: {
        totalTransactions: 9500,
        openFlags: 7,
      },
      isLoading: false,
    });
    render(createElement(AdminDashboardPage), { wrapper });
    expect(screen.getByText("9,500")).toBeTruthy();
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("renders with null flags and exceptions data", () => {
    mockOverview.mockReturnValue({ data: {}, isLoading: false });
    mockFlags.mockReturnValue({ data: null });
    mockExceptions.mockReturnValue({ data: null });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getByText("No open flags")).toBeTruthy();
    expect(screen.getByText("No open exceptions")).toBeTruthy();
  });

  it("renders with empty paginated flags and exceptions", () => {
    mockOverview.mockReturnValue({ data: {}, isLoading: false });
    mockFlags.mockReturnValue({ data: { data: [], pagination: { total: 0, limit: 5, offset: 0, hasMore: false } } });
    mockExceptions.mockReturnValue({ data: { data: [], pagination: { total: 0, limit: 5, offset: 0, hasMore: false } } });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getByText("No open flags")).toBeTruthy();
  });

  it("renders flags with null fields gracefully", () => {
    mockOverview.mockReturnValue({ data: {}, isLoading: false });
    mockFlags.mockReturnValue({
      data: {
        data: [
          { id: "f1", flagType: null, description: null, severity: "warning" },
          { id: "f2", flagType: "suspicious_activity", description: "Large transfer detected", severity: "critical" },
        ],
        pagination: { total: 2, limit: 5, offset: 0, hasMore: false },
      },
    });
    mockExceptions.mockReturnValue({ data: { data: [], pagination: { total: 0, limit: 5, offset: 0, hasMore: false } } });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders exceptions with null fields gracefully", () => {
    mockOverview.mockReturnValue({ data: {}, isLoading: false });
    mockFlags.mockReturnValue({ data: { data: [], pagination: { total: 0, limit: 5, offset: 0, hasMore: false } } });
    mockExceptions.mockReturnValue({
      data: {
        data: [
          { id: "e1", errorType: null, ethSwitchReference: null, status: "open" },
        ],
        pagination: { total: 1, limit: 5, offset: 0, hasMore: false },
      },
    });
    const { container } = render(createElement(AdminDashboardPage), { wrapper });
    expect(container).toBeTruthy();
  });
});
