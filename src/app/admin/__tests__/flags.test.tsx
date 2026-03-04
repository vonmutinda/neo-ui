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
  usePathname: () => "/admin",
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockFlags = vi.fn();
const mockCreateFlag = vi.fn();
const mockResolveFlag = vi.fn();

vi.mock("@/hooks/admin/use-admin-flags", () => ({
  useAdminFlags: () => mockFlags(),
  useAdminCreateFlag: () => mockCreateFlag(),
  useAdminResolveFlag: () => mockResolveFlag(),
}));

import FlagsPage from "../(authenticated)/flags/page";

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return createElement(QueryClientProvider, { client: qc }, children);
}

beforeEach(() => {
  mockFlags.mockReturnValue({ data: null, isLoading: false });
  mockCreateFlag.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockResolveFlag.mockReturnValue({ mutate: vi.fn(), isPending: false });
});

describe("FlagsPage", () => {
  it("renders loading state without crashing", () => {
    mockFlags.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(createElement(FlagsPage), { wrapper });
    expect(container).toBeTruthy();
  });

  it("renders with null data (shows No flags found)", () => {
    mockFlags.mockReturnValue({ data: null, isLoading: false });
    render(createElement(FlagsPage), { wrapper });
    expect(screen.getByText("No flags found")).toBeTruthy();
  });

  it("renders with empty paginated response", () => {
    mockFlags.mockReturnValue({
      data: { data: [], pagination: { total: 0, limit: 20, offset: 0, hasMore: false } },
      isLoading: false,
    });
    render(createElement(FlagsPage), { wrapper });
    expect(screen.getByText("No flags found")).toBeTruthy();
  });

  it("renders flags with data (unresolved flags show Resolve button)", () => {
    mockFlags.mockReturnValue({
      data: {
        data: [
          {
            id: "f1",
            userId: "user-123",
            flagType: "suspicious_activity",
            severity: "warning",
            description: "Large transfer detected",
            isResolved: false,
            createdAt: "2025-01-15T10:00:00Z",
            updatedAt: "2025-01-15T10:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(FlagsPage), { wrapper });
    expect(screen.getByRole("button", { name: /resolve/i })).toBeTruthy();
  });

  it("resolved flags show Resolved badge instead of Resolve button", () => {
    mockFlags.mockReturnValue({
      data: {
        data: [
          {
            id: "f2",
            userId: "user-456",
            flagType: "aml_alert",
            severity: "critical",
            description: "AML check failed",
            isResolved: true,
            createdAt: "2025-01-14T09:00:00Z",
            updatedAt: "2025-01-15T11:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    render(createElement(FlagsPage), { wrapper });
    expect(screen.getByText("resolved")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /^resolve$/i })).toBeNull();
  });

  it("Create Flag button exists and is clickable", () => {
    mockFlags.mockReturnValue({ data: null, isLoading: false });
    render(createElement(FlagsPage), { wrapper });
    const btn = screen.getByRole("button", { name: /create flag/i });
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
  });

  it("create form appears when button is clicked", () => {
    mockFlags.mockReturnValue({ data: null, isLoading: false });
    render(createElement(FlagsPage), { wrapper });
    const btn = screen.getByRole("button", { name: /create flag/i });
    fireEvent.click(btn);
    expect(screen.getByText("Create New Flag")).toBeTruthy();
  });

  it("renders flags with null fields gracefully", () => {
    mockFlags.mockReturnValue({
      data: {
        data: [
          {
            id: "f3",
            userId: null,
            flagType: null,
            severity: "info",
            description: null,
            isResolved: false,
            createdAt: "2025-01-13T08:00:00Z",
            updatedAt: "2025-01-13T08:00:00Z",
          },
        ],
        pagination: { total: 1, limit: 20, offset: 0, hasMore: false },
      },
      isLoading: false,
    });
    const { container } = render(createElement(FlagsPage), { wrapper });
    expect(container).toBeTruthy();
  });
});
