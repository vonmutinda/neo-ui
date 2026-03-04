import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/requests/new/split",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) =>
      createElement("div", props, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

const mockResolve = vi.fn();
const mockBatchCreate = vi.fn();

vi.mock("@/hooks/use-resolve-recipient", () => ({
  useResolveRecipient: () => ({
    mutate: mockResolve,
    mutateAsync: mockResolve,
    isPending: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/use-payment-requests", () => ({
  useCreateBatchPaymentRequest: () => ({
    mutate: mockBatchCreate,
    mutateAsync: mockBatchCreate,
    isPending: false,
  }),
}));

import SplitRequestPage from "../new/split/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockResolve.mockReset();
  mockBatchCreate.mockReset();
});

describe("SplitRequestPage", () => {
  it("renders step 1 with lookup input", () => {
    render(createElement(SplitRequestPage), { wrapper });
    expect(screen.getByText("Add people")).toBeTruthy();
    expect(screen.getByPlaceholderText("Phone or @username")).toBeTruthy();
  });

  it("disables Continue with fewer than 2 recipients", () => {
    render(createElement(SplitRequestPage), { wrapper });
    const continueBtn = screen.getByText("Continue");
    expect(continueBtn.closest("button")?.disabled).toBe(true);
  });

  it("shows split mode toggle on step 2", () => {
    render(createElement(SplitRequestPage), { wrapper });

    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({
        id: "u1",
        phoneNumber: "+251911111111",
        firstName: "Abebe",
        lastName: "Bikila",
      });
    });

    const input = screen.getByPlaceholderText("Phone or @username");
    fireEvent.change(input, { target: { value: "+251911111111" } });
    fireEvent.click(screen.getByText("Lookup"));

    fireEvent.change(input, { target: { value: "+251922222222" } });
    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({
        id: "u2",
        phoneNumber: "+251922222222",
        firstName: "Dawit",
        lastName: "Haile",
      });
    });
    fireEvent.click(screen.getByText("Lookup"));

    fireEvent.click(screen.getByText("Continue"));

    expect(screen.getByText("Split evenly")).toBeTruthy();
    expect(screen.getByText("Custom amounts")).toBeTruthy();
  });

  it("shows per-person inputs in custom mode", () => {
    render(createElement(SplitRequestPage), { wrapper });

    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({
        id: "u1",
        phoneNumber: "+251911111111",
        firstName: "Abebe",
      });
    });
    fireEvent.change(screen.getByPlaceholderText("Phone or @username"), {
      target: { value: "+251911111111" },
    });
    fireEvent.click(screen.getByText("Lookup"));

    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({
        id: "u2",
        phoneNumber: "+251922222222",
        firstName: "Dawit",
      });
    });
    fireEvent.change(screen.getByPlaceholderText("Phone or @username"), {
      target: { value: "+251922222222" },
    });
    fireEvent.click(screen.getByText("Lookup"));

    fireEvent.click(screen.getByText("Continue"));

    fireEvent.click(screen.getByText("Custom amounts"));

    const amountInputs = screen.getAllByPlaceholderText("0.00");
    expect(amountInputs.length).toBe(2);
  });

  it("shows narration input on step 2", () => {
    render(createElement(SplitRequestPage), { wrapper });

    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({ id: "u1", phoneNumber: "+251911111111", firstName: "A" });
    });
    fireEvent.change(screen.getByPlaceholderText("Phone or @username"), {
      target: { value: "+251911111111" },
    });
    fireEvent.click(screen.getByText("Lookup"));

    mockResolve.mockImplementation((_id: string, opts: { onSuccess: (info: unknown) => void }) => {
      opts.onSuccess({ id: "u2", phoneNumber: "+251922222222", firstName: "B" });
    });
    fireEvent.change(screen.getByPlaceholderText("Phone or @username"), {
      target: { value: "+251922222222" },
    });
    fireEvent.click(screen.getByText("Lookup"));

    fireEvent.click(screen.getByText("Continue"));

    expect(
      screen.getByPlaceholderText("e.g. Dinner at Yod Abyssinia"),
    ).toBeTruthy();
  });
});
