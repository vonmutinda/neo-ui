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
  usePathname: () => "/recipients",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: Record<string, unknown>) =>
      createElement("div", props, children as ReactNode),
    circle: (props: Record<string, unknown>) => createElement("circle", props),
    span: ({ children, ...props }: Record<string, unknown>) =>
      createElement("span", props, children as ReactNode),
  },
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));

const mockRecipients = vi.fn();
const mockToggleFavorite = vi.fn();
const mockBeneficiaries = vi.fn();
const mockCreateBeneficiary = vi.fn();
const mockDeleteBeneficiary = vi.fn();

const mockCreateRecipient = vi.fn();

vi.mock("@/hooks/use-recipients", () => ({
  useRecipients: () => mockRecipients(),
  useToggleFavorite: () => ({ mutate: mockToggleFavorite, isPending: false }),
  useCreateRecipient: () => ({
    mutate: mockCreateRecipient,
    mutateAsync: mockCreateRecipient,
    isPending: false,
  }),
  useBanks: () => ({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/use-resolve-recipient", () => ({
  useResolveRecipient: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-beneficiaries", () => ({
  useBeneficiaries: () => mockBeneficiaries(),
  useCreateBeneficiary: () => ({
    mutate: mockCreateBeneficiary,
    mutateAsync: mockCreateBeneficiary,
    isPending: false,
  }),
  useDeleteBeneficiary: () => ({
    mutate: mockDeleteBeneficiary,
    isPending: false,
  }),
}));

import RecipientsPage from "../page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockRecipients.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mockBeneficiaries.mockReturnValue({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
});

describe("RecipientsPage", () => {
  it("renders loading skeletons", () => {
    mockRecipients.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    const { container } = render(createElement(RecipientsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders empty state when no recipients", () => {
    mockRecipients.mockReturnValue({
      data: { recipients: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    expect(screen.getByText("No recipients yet")).toBeTruthy();
  });

  it("renders error state with retry", () => {
    const refetch = vi.fn();
    mockRecipients.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(createElement(RecipientsPage), { wrapper });
    expect(screen.getByText("Could not load recipients")).toBeTruthy();
    fireEvent.click(screen.getByText("Try again"));
    expect(refetch).toHaveBeenCalled();
  });

  it("renders recipient list", () => {
    mockRecipients.mockReturnValue({
      data: {
        recipients: [
          {
            id: "r1",
            type: "enviar_user",
            displayName: "Abebe Bikila",
            username: "abebe",
            isFavorite: true,
            isBeneficiary: false,
            transferCount: 5,
            status: "active",
          },
          {
            id: "r2",
            type: "bank_account",
            displayName: "Dawit Haile",
            bankName: "CBE",
            accountNumberMasked: "****1234",
            isFavorite: false,
            isBeneficiary: true,
            transferCount: 2,
            status: "active",
          },
        ],
        total: 2,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    expect(screen.getByText("Abebe Bikila")).toBeTruthy();
    expect(screen.getByText("Dawit Haile")).toBeTruthy();
    expect(screen.getByText("@abebe")).toBeTruthy();
  });

  it("shows beneficiaries tab with empty state", () => {
    mockBeneficiaries.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    fireEvent.click(screen.getByText("Beneficiaries"));
    expect(screen.getByText("No beneficiaries added")).toBeTruthy();
  });

  it("renders beneficiary list", () => {
    mockBeneficiaries.mockReturnValue({
      data: [
        {
          id: "b1",
          fullName: "Almaz Kebede",
          relationship: "spouse",
          isVerified: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          id: "b2",
          fullName: "Dawit Haile",
          relationship: "child",
          isVerified: false,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    fireEvent.click(screen.getByText("Beneficiaries"));
    expect(screen.getByText("Almaz Kebede")).toBeTruthy();
    expect(screen.getByText("Dawit Haile")).toBeTruthy();
  });

  it("shows filter chips", () => {
    mockRecipients.mockReturnValue({
      data: { recipients: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Enviar Users")).toBeTruthy();
    expect(screen.getByText("Bank Accounts")).toBeTruthy();
    expect(screen.getByText("Favorites")).toBeTruthy();
  });

  it("shows search input", () => {
    mockRecipients.mockReturnValue({
      data: { recipients: [], total: 0 },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(createElement(RecipientsPage), { wrapper });
    expect(screen.getByPlaceholderText("Search recipients...")).toBeTruthy();
  });
});
