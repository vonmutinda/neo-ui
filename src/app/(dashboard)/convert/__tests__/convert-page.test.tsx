import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: (props: Record<string, unknown>) => createElement("div", props),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

const mockUseExchangeRate = vi.fn();
const mockUseBalances = vi.fn();
const mockUseConvert = vi.fn();

vi.mock("@/hooks/use-convert", () => ({
  useExchangeRate: () => mockUseExchangeRate(),
  useConvert: () => mockUseConvert(),
}));

vi.mock("@/hooks/use-balances", () => ({
  useBalances: () => mockUseBalances(),
}));

import ConvertPage from "../page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockUseBalances.mockReturnValue({ data: [{ currencyCode: "ETB", balanceCents: 100000, display: "1,000.00 ETB" }] });
  mockUseConvert.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
});

describe("ConvertPage", () => {
  it("shows Loading rate... when rate is loading", () => {
    mockUseExchangeRate.mockReturnValue({ data: undefined, isLoading: true });
    render(createElement(ConvertPage), { wrapper });
    expect(screen.getByRole("button", { name: /loading rate/i })).toBeTruthy();
  });

  it("shows Review conversion when rate is loaded and amount is valid", () => {
    mockUseExchangeRate.mockReturnValue({
      data: { mid: 52, ask: 53, bid: 51, from: "ETB", to: "USD", timestamp: new Date(), source: "test", spread: 0 },
      isLoading: false,
    });
    render(createElement(ConvertPage), { wrapper });
    const reviewButton = screen.queryByRole("button", { name: /review conversion/i });
    expect(reviewButton).toBeTruthy();
  });

  it("shows Rate unavailable when rate ask is 0 and amount entered", () => {
    mockUseExchangeRate.mockReturnValue({
      data: { mid: 0, ask: 0, bid: 0, from: "ETB", to: "USD", timestamp: new Date(), source: "test", spread: 0 },
      isLoading: false,
    });
    render(createElement(ConvertPage), { wrapper });
    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "100" } });
    expect(screen.getByRole("button", { name: /rate unavailable/i })).toBeTruthy();
  });
});
