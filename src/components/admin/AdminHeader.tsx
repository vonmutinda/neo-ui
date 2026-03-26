"use client";

import { usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import { StatusBadge } from "./StatusBadge";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/customers": "Customers",
  "/admin/transactions": "Transactions",
  "/admin/loans": "Loan Book",
  "/admin/cards": "Cards",
  "/admin/reconciliation": "Reconciliation",
  "/admin/audit": "Audit Log",
  "/admin/flags": "Flags",
  "/admin/staff": "Staff Management",
  "/admin/settings": "Settings",
};

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  if (pathname.startsWith("/admin/customers/")) return "Customer Detail";
  if (pathname.startsWith("/admin/transactions/")) return "Transaction Detail";
  if (pathname.startsWith("/admin/loans/")) return "Loan Detail";
  if (pathname.startsWith("/admin/cards/")) return "Card Detail";

  return "Admin";
}

export function AdminHeader() {
  const pathname = usePathname();
  const staff = useAdminAuthStore((s) => s.staff);
  const title = resolveTitle(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <StatusBadge
          status={staff?.role ?? "unknown"}
          className="bg-primary/10 text-primary"
        />
        <span className="text-sm text-muted-foreground">{staff?.fullName}</span>
      </div>
    </header>
  );
}
