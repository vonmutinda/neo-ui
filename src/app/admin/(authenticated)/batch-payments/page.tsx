"use client";

import Link from "next/link";
import { useAdminBatchPaymentList } from "@/hooks/admin/use-admin-batch-payments-list";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminBatchPaymentsPage() {
  const { data, isLoading } = useAdminBatchPaymentList(25, 0);
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Batch payments</h1>
      <p className="text-sm text-muted-foreground">
        Business bulk payment batches (read-only).
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No batch payments
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/batch-payments/${r.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3 font-tabular">{r.itemCount}</td>
                  <td className="px-4 py-3 font-tabular">
                    {formatMoney(
                      r.totalCents,
                      r.currencyCode as SupportedCurrency,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
