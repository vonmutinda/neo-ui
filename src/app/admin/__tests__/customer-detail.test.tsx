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
  usePathname: () => "/admin/customers/test-id",
}));

vi.mock("framer-motion", () => ({
  motion: { div: (props: Record<string, unknown>) => createElement("div", props) },
  AnimatePresence: ({ children }: { children: ReactNode }) => createElement("div", null, children),
}));

const mockCustomer = vi.fn();
const mockCustomerFlags = vi.fn();

vi.mock("@/hooks/admin/use-admin-customers", () => ({
  useAdminCustomer: () => mockCustomer(),
  useAdminCustomerFlags: () => mockCustomerFlags(),
}));

import CustomerDetailPage from "../(authenticated)/customers/[id]/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

const resolvedParams = Promise.resolve({ id: "test-id" });

beforeEach(() => {
  mockCustomer.mockReturnValue({ data: null, isLoading: false });
  mockCustomerFlags.mockReturnValue({ data: null });
});

describe("CustomerDetailPage", () => {
  it("renders loading state without crashing", () => {
    mockCustomer.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders not-found when profile is null", () => {
    mockCustomer.mockReturnValue({ data: null, isLoading: false });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("Customer not found")).toBeTruthy();
  });

  it("renders with minimal profile (null arrays)", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: null,
        recentTransactions: null,
        creditProfile: null,
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
        pots: [],
        kycVerifications: [],
        totalInETBCents: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with undefined arrays (missing fields)", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 2, isFrozen: false },
        totalDisplay: "ETB 100.00",
        activeLoans: 1,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: [] });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null user fields", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: {
          id: "u1",
          phoneNumber: null,
          firstName: null,
          middleName: null,
          lastName: null,
          kycLevel: null,
          isFrozen: false,
        },
        currencyBalances: [],
        recentTransactions: [],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with populated balances", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", firstName: "Abebe", lastName: "Kebede", kycLevel: 2, isFrozen: false },
        currencyBalances: [
          { currencyCode: "ETB", isPrimary: true, balanceCents: 50000, display: "ETB 500.00" },
          { currencyCode: "USD", isPrimary: false, balanceCents: 10000, display: "USD 100.00" },
        ],
        recentTransactions: [],
        totalDisplay: "ETB 500.00",
        activeLoans: 0,
        activeCards: 1,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: [{ id: "f1" }] });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getByText("Currency Balances")).toBeTruthy();
  });

  it("renders transactions with null fields", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [
          { id: "tx1", type: null, currency: null, amountCents: null, status: "completed", counterpartyName: null, narration: null },
          { id: "tx2", type: "p2p_send", currency: "ETB", amountCents: 5000, status: "completed", counterpartyName: "John" },
        ],
        totalDisplay: "ETB 50.00",
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
    expect(screen.getByText("Recent Transactions")).toBeTruthy();
  });

  it("renders with null user object", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: null,
        currencyBalances: [],
        recentTransactions: [],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    const { container } = render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders KYC verifications when present", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
        kycVerifications: [
          { id: "kyc1", faydaFin: "FIN-12345", status: "verified", verifiedAt: "2026-01-15T10:00:00Z" },
        ],
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("KYC Verifications")).toBeTruthy();
    expect(screen.getByText(/FIN-12345/)).toBeTruthy();
  });

  it("renders savings pots when present", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
        pots: [
          { id: "pot1", name: "Vacation Fund", currencyCode: "ETB", balanceCents: 25000, targetCents: 100000, progressPercent: 25 },
        ],
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("Savings Pots")).toBeTruthy();
    expect(screen.getByText("Vacation Fund")).toBeTruthy();
  });

  it("renders internal notes when present", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
        internalNotes: [
          { id: "note1", action: "admin_note", actorType: "admin", actorId: "staff-1", resourceType: "user", resourceId: "u1", metadata: { note: "Called customer about issue" }, createdAt: "2026-01-15T10:00:00Z" },
        ],
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("Internal Notes")).toBeTruthy();
    expect(screen.getByText("Called customer about issue")).toBeTruthy();
  });

  it("renders account details on currency balances", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [
          { currencyCode: "ETB", isPrimary: true, balanceCents: 50000, display: "ETB 500.00", accountDetails: { iban: "ET12345", accountNumber: "1234567890", bankName: "CBE", swiftCode: "CBEETAA" } },
        ],
        recentTransactions: [],
        totalDisplay: "ETB 500.00",
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText(/CBE/)).toBeTruthy();
    expect(screen.getByText(/1234567890/)).toBeTruthy();
  });

  it("renders human-readable transaction types", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [
          { id: "tx1", type: "p2p_send", currency: "ETB", amountCents: 5000, status: "completed", counterpartyName: null, narration: null },
        ],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("P2P Send")).toBeTruthy();
  });

  it("renders FX conversion transactions with correct label", () => {
    mockCustomer.mockReturnValue({
      data: {
        user: { id: "u1", phoneNumber: "+251911000001", kycLevel: 1, isFrozen: false },
        currencyBalances: [],
        recentTransactions: [
          { id: "tx-conv", type: "convert_out", currency: "ETB", amountCents: 50000, status: "completed", counterpartyName: null, narration: "Converted 500.00 ETB to 10.00 USD" },
        ],
        totalDisplay: null,
        activeLoans: 0,
        activeCards: 0,
      },
      isLoading: false,
    });
    mockCustomerFlags.mockReturnValue({ data: null });
    render(createElement(CustomerDetailPage, { params: resolvedParams }), { wrapper });
    expect(screen.getByText("FX Conversion")).toBeTruthy();
  });
});
