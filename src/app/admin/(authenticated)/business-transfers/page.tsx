"use client";

import { useState } from "react";
import {
  useAdminBusinessTransfers,
  useAdminPendingBusinessTransfers,
} from "@/hooks/admin/use-admin-business-transfers";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

type Tab = "all" | "pending";

export default function AdminBusinessTransfersPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(0);
  const limit = 25;

  const allQuery = useAdminBusinessTransfers(limit, page * limit);
  const pendingQuery = useAdminPendingBusinessTransfers(limit, page * limit);

  const query = tab === "pending" ? pendingQuery : allQuery;
  const rows = query.data?.data ?? [];
  const total = query.data?.pagination?.total ?? 0;

  function switchTab(t: Tab) {
    setTab(t);
    setPage(0);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Business Transfers</h1>
      <p className="text-sm text-muted-foreground">
        All transfers initiated by businesses, including pending approvals.
      </p>

      <div className="flex gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {(["all", "pending"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : "Pending"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Business</th>
              <th className="px-4 py-3 font-semibold">Recipient</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {query.isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {tab === "pending"
                    ? "No pending transfers"
                    : "No business transfers found"}
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-medium">
                    {t.businessId?.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    {(t.recipientInfo?.name as string) ??
                      (t.recipientInfo?.phone as string) ??
                      "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatMoney(
                      t.amountCents,
                      t.currencyCode as SupportedCurrency,
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.createdAt
                      ? new Date(t.createdAt).toLocaleDateString()
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
