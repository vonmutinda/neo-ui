"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminLoans, useAdminLoanSummary } from "@/hooks/admin/use-admin-loans";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatsCard } from "@/components/admin/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Landmark, Percent, TrendingUp } from "lucide-react";
import type { LoanFilter } from "@/lib/admin-types";

export default function LoansPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<LoanFilter>({ limit: 20, offset: 0 });
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminLoans(filter);
  const { data: summary, isLoading: summaryLoading } = useAdminLoanSummary();

  function handleSearch() {
    setFilter((f) => ({ ...f, search: search || undefined, offset: 0 }));
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Total Disbursed"
            value={summary.totalDisbursedCents ? `ETB ${(summary.totalDisbursedCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
            icon={Landmark}
          />
          <StatsCard
            label="Total Outstanding"
            value={summary.totalOutstandingCents ? `ETB ${(summary.totalOutstandingCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
            icon={TrendingUp}
          />
          <StatsCard
            label="Portfolio at Risk"
            value={summary.portfolioAtRiskPercent != null ? `${summary.portfolioAtRiskPercent.toFixed(1)}%` : "—"}
            icon={Percent}
          />
          <StatsCard
            label="Total Loans"
            value={summary.totalLoansIssued ?? 0}
            icon={Landmark}
          />
        </div>
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by loan ID or user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-10 rounded-[10px] pl-10"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Loan ID</th>
                <th className="px-4 py-3 font-semibold">User ID</th>
                <th className="px-4 py-3 font-semibold">Principal</th>
                <th className="px-4 py-3 font-semibold">Outstanding</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold">Days Past Due</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No loans found</td>
                </tr>
              ) : (
                items.map((loan) => {
                  const outstanding = (loan.totalDueCents ?? 0) - (loan.totalPaidCents ?? 0);
                  return (
                    <tr
                      key={loan.id}
                      onClick={() => router.push(`/admin/loans/${loan.id}`)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-mono text-muted-foreground">{loan.id?.slice(0, 8) ?? "—"}...</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{loan.userId?.slice(0, 8) ?? "—"}...</td>
                      <td className="px-4 py-3 font-tabular">{((loan.principalAmountCents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 font-tabular">{(outstanding / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{loan.daysPastDue}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.offset === 0}
                onClick={() => setFilter((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)) }))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasMore}
                onClick={() => setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + (f.limit ?? 20) }))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
