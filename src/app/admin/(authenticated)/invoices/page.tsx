"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminInvoices } from "@/hooks/admin/use-admin-invoices";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(0);
  const limit = 25;
  const { data, isLoading } = useAdminInvoices(limit, page * limit);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Invoices</h1>
      <p className="text-sm text-muted-foreground">
        All invoices issued by businesses across the platform.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Invoice #</th>
              <th className="px-4 py-3 font-semibold">Business</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 font-semibold">Due</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              rows.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/invoices/${inv.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{inv.businessId?.slice(0, 8)}…</td>
                  <td className="px-4 py-3">{inv.customerName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatMoney(
                      inv.totalCents,
                      inv.currencyCode as SupportedCurrency,
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of{" "}
            {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1.5 hover:bg-muted disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
