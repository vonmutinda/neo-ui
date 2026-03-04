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
  usePathname: () => "/admin/cards",
}));

const mockCards = vi.fn();

vi.mock("@/hooks/admin/use-admin-cards", () => ({
  useAdminCards: () => mockCards(),
}));

import CardsPage from "../(authenticated)/cards/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockCards.mockReturnValue({ data: null, isLoading: false });
});

describe("CardsPage", () => {
  it("renders loading state without crashing", () => {
    mockCards.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(CardsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null data", () => {
    render(createElement(CardsPage), { wrapper });
    expect(screen.getByText("No cards found")).toBeTruthy();
  });

  it("renders with empty paginated response", () => {
    mockCards.mockReturnValue({
      data: { data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } },
      isLoading: false,
    });
    render(createElement(CardsPage), { wrapper });
    expect(screen.getByText("No cards found")).toBeTruthy();
  });

  it("renders cards with null fields", () => {
    mockCards.mockReturnValue({
      data: {
        data: [
          {
            id: null,
            userId: null,
            lastFour: null,
            type: null,
            status: null,
            dailyLimitCents: null,
            createdAt: "2026-01-15T10:00:00Z",
          },
          {
            id: "card-abcdefgh",
            userId: "user-12345678",
            lastFour: "4242",
            type: "virtual",
            status: "active",
            dailyLimitCents: 500000,
            createdAt: "2026-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 2, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    const { container } = render(createElement(CardsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders pagination controls", () => {
    mockCards.mockReturnValue({
      data: {
        data: [
          { id: "c1", userId: "u1", lastFour: "1234", type: "physical", status: "active", dailyLimitCents: 100000, createdAt: "2026-01-15T10:00:00Z" },
        ],
        pagination: { total: 100, limit: 20, offset: 0, hasMore: true },
      },
      isLoading: false,
    });
    render(createElement(CardsPage), { wrapper });
    expect(screen.getByText(/Showing 1–20 of 100/)).toBeTruthy();
  });
});
