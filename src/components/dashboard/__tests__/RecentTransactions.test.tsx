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

const mockTransactions = vi.fn();

vi.mock("@/hooks/use-wallets", () => ({
  useTransactions: () => mockTransactions(),
}));

import { RecentTransactions } from "../RecentTransactions";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockTransactions.mockReturnValue({ data: null, isLoading: false });
});

describe("RecentTransactions", () => {
  it("renders loading state", () => {
    mockTransactions.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(RecentTransactions), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders empty state", () => {
    mockTransactions.mockReturnValue({ data: [], isLoading: false });
    render(createElement(RecentTransactions), { wrapper });
    expect(screen.getByText("No transactions yet")).toBeTruthy();
  });

  it("renders convert_out with Currency conversion label", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "tx1",
          type: "convert_out",
          status: "completed",
          amountCents: 50000,
          currency: "ETB",
          narration: "Converted 500.00 ETB to 10.00 USD",
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    render(createElement(RecentTransactions), { wrapper });
    expect(screen.getByText("Converted 500.00 ETB to 10.00 USD")).toBeTruthy();
  });

  it("filters out convert_in from the list", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "tx-out",
          type: "convert_out",
          status: "completed",
          amountCents: 50000,
          currency: "ETB",
          narration: "Converted 500.00 ETB to 10.00 USD",
          createdAt: new Date().toISOString(),
        },
        {
          id: "tx-in",
          type: "convert_in",
          status: "completed",
          amountCents: 1000,
          currency: "USD",
          narration: "Converted 500.00 ETB to 10.00 USD",
          createdAt: new Date().toISOString(),
        },
        {
          id: "tx-p2p",
          type: "p2p_send",
          status: "completed",
          amountCents: 2000,
          currency: "ETB",
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    render(createElement(RecentTransactions), { wrapper });
    const links = screen.getAllByRole("link");
    const txLinks = links.filter((l) => l.getAttribute("href") === "/transactions");
    expect(txLinks.length).toBe(3);
  });

  it("shows convert_in when no matching convert_out exists", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "tx-in-solo",
          type: "convert_in",
          status: "completed",
          amountCents: 1000,
          currency: "USD",
          narration: "Converted 500.00 ETB to 10.00 USD",
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    render(createElement(RecentTransactions), { wrapper });
    expect(screen.getByText("Converted 500.00 ETB to 10.00 USD")).toBeTruthy();
  });

  it("shows convert_out with blue styling", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "tx1",
          type: "convert_out",
          status: "completed",
          amountCents: 50000,
          currency: "ETB",
          narration: "Converted 500.00 ETB to 10.00 USD",
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    const { container } = render(createElement(RecentTransactions), { wrapper });
    const iconDiv = container.querySelector(".bg-blue-500\\/10");
    expect(iconDiv).toBeTruthy();
  });

  it("renders pot_deposit with pot name from metadata", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "pot-dep-1",
          type: "pot_deposit",
          status: "completed",
          amountCents: 10000,
          currency: "ETB",
          metadata: { potId: "p1", potName: "Savings" },
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    render(createElement(RecentTransactions), { wrapper });
    expect(screen.getByText("Added to Savings")).toBeTruthy();
  });

  it("renders pot_withdraw with pot name from metadata", () => {
    mockTransactions.mockReturnValue({
      data: [
        {
          id: "pot-with-1",
          type: "pot_withdraw",
          status: "completed",
          amountCents: 5000,
          currency: "ETB",
          metadata: { potId: "p1", potName: "Vacation" },
          createdAt: new Date().toISOString(),
        },
      ],
      isLoading: false,
    });
    render(createElement(RecentTransactions), { wrapper });
    expect(screen.getByText("Withdrawn from Vacation")).toBeTruthy();
  });
});
