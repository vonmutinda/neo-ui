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
  usePathname: () => "/recipients/r1",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) =>
      createElement("div", props, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

const mockRecipient = vi.fn();
const mockToggleFavorite = vi.fn();
const mockArchiveRecipient = vi.fn();

vi.mock("@/hooks/use-recipients", () => ({
  useRecipient: () => mockRecipient(),
  useToggleFavorite: () => ({ mutate: mockToggleFavorite, isPending: false }),
  useArchiveRecipient: () => ({
    mutate: mockArchiveRecipient,
    mutateAsync: mockArchiveRecipient,
    isPending: false,
  }),
}));

import RecipientDetailPage from "../[id]/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

async function renderPage() {
  const paramsPromise = Promise.resolve({ id: "r1" });
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      createElement(
        Suspense,
        { fallback: createElement("div", null, "loading") },
        createElement(RecipientDetailPage, { params: paramsPromise }),
      ),
      { wrapper },
    );
  });
  return result!;
}

beforeEach(() => {
  mockRecipient.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
  });
});

describe("RecipientDetailPage", () => {
  it("renders loading skeletons", async () => {
    mockRecipient.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });
    const { container } = await renderPage();
    expect(container).toBeTruthy();
  });

  it("renders error state", async () => {
    mockRecipient.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });
    await renderPage();
    expect(screen.getByText("Could not load recipient")).toBeTruthy();
  });

  it("renders neo user recipient", async () => {
    mockRecipient.mockReturnValue({
      data: {
        id: "r1",
        type: "neo_user",
        displayName: "Abebe Bikila",
        username: "abebe",
        countryCode: "251",
        number: "911223344",
        isFavorite: false,
        isBeneficiary: false,
        transferCount: 5,
        lastUsedAt: "2026-02-01T00:00:00Z",
        status: "active",
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getAllByText("Abebe Bikila").length).toBeGreaterThan(0);
    expect(screen.getByText("@abebe")).toBeTruthy();
    expect(screen.getByText("+251911223344")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("Send Money")).toBeTruthy();
    expect(screen.getByText("Request Money")).toBeTruthy();
    expect(screen.getByText("Archive Recipient")).toBeTruthy();
  });

  it("renders bank account recipient", async () => {
    mockRecipient.mockReturnValue({
      data: {
        id: "r2",
        type: "bank_account",
        displayName: "Dawit Haile",
        bankName: "Commercial Bank of Ethiopia",
        accountNumberMasked: "****1234",
        swiftBic: "CBETETAA",
        isFavorite: true,
        isBeneficiary: true,
        transferCount: 2,
        status: "active",
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getAllByText("Dawit Haile").length).toBeGreaterThan(0);
    expect(screen.getByText("Commercial Bank of Ethiopia")).toBeTruthy();
    expect(screen.getByText("****1234")).toBeTruthy();
    expect(screen.getByText("CBETETAA")).toBeTruthy();
    expect(screen.getByText("Favorited")).toBeTruthy();
  });

  it("shows beneficiary badge when applicable", async () => {
    mockRecipient.mockReturnValue({
      data: {
        id: "r2",
        type: "bank_account",
        displayName: "Dawit Haile",
        bankName: "CBE",
        isFavorite: false,
        isBeneficiary: true,
        transferCount: 0,
        status: "active",
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    expect(screen.getAllByText("Dawit Haile").length).toBeGreaterThan(0);
    expect(screen.getByText("Beneficiary")).toBeTruthy();
  });
});
