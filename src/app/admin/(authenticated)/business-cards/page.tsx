"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminBusinessCards } from "@/hooks/admin/use-admin-business-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMoney } from "@/lib/format";

export default function AdminBusinessCardsPage() {
  const [page, setPage] = useState(0);
  const limit = 25;
  const { data, isLoading } = useAdminBusinessCards(limit, page * limit);
  const rows = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Business Cards</h1>
      <p className="text-sm text-muted-foreground">
        All cards issued by businesses across the platform.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Business</th>
              <th className="px-4 py-3 font-semibold">Cardholder</th>
              <th className="px-4 py-3 font-semibold">Card</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">
                Spent / Limit
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
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
                  No business cards found
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/businesses/${c.businessId}`}
                      className="text-primary hover:underline"
                    >
                      {c.businessId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.memberName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize">
                      {c.card?.type ?? c.label}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ••{c.card?.lastFour ?? "????"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={
                        c.card?.status ?? (c.isActive ? "active" : "inactive")
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-tabular">
                    {formatMoney(c.spentCents, "ETB")}{" "}
                    <span className="text-muted-foreground">/</span>{" "}
                    {formatMoney(c.spendLimitCents, "ETB")}
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
