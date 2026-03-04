"use client";

import { useAdminOverview } from "@/hooks/admin/use-admin-analytics";
import { useAdminFlags } from "@/hooks/admin/use-admin-flags";
import { useAdminReconExceptions } from "@/hooks/admin/use-admin-recon";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  Flag,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

export default function AdminDashboardPage() {
  const { data: overview, isLoading } = useAdminOverview();
  const { data: flagsData } = useAdminFlags({ isResolved: false, limit: 5 });
  const { data: exceptionsData } = useAdminReconExceptions({ status: "open", limit: 5 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const flags = Array.isArray(flagsData?.data) ? flagsData.data : [];
  const exceptions = Array.isArray(exceptionsData?.data) ? exceptionsData.data : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Customers"
          value={overview?.totalCustomers?.toLocaleString() ?? "—"}
          icon={Users}
        />
        <StatsCard
          label="Active (30d)"
          value={overview?.activeCustomers30d?.toLocaleString() ?? "—"}
          icon={TrendingUp}
        />
        <StatsCard
          label="Total Transactions"
          value={overview?.totalTransactions?.toLocaleString() ?? "—"}
          icon={ArrowLeftRight}
        />
        <StatsCard
          label="Open Flags"
          value={overview?.openFlags?.toLocaleString() ?? "—"}
          icon={Flag}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Active Loans"
          value={overview?.activeLoans?.toLocaleString() ?? "—"}
          icon={Landmark}
        />
        <StatsCard
          label="Loan Outstanding"
          value={overview?.totalLoanOutstandingCents
            ? formatMoney(overview.totalLoanOutstandingCents, "ETB")
            : "—"}
          icon={Landmark}
        />
        <StatsCard
          label="Active Cards"
          value={overview?.activeCards?.toLocaleString() ?? "—"}
          icon={CreditCard}
        />
        <StatsCard
          label="Frozen Accounts"
          value={overview?.frozenAccounts?.toLocaleString() ?? "—"}
          icon={AlertTriangle}
        />
      </div>

      {overview?.kycBreakdown && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">KYC Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(overview.kycBreakdown).map(([level, count]) => (
              <div key={level} className="text-center">
                <p className="font-tabular text-xl font-semibold">{(count as number).toLocaleString()}</p>
                <p className="text-xs capitalize text-muted-foreground">Level {level}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Open Flags</h3>
            <Link href="/admin/flags" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {flags.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No open flags</p>
          ) : (
            <div className="space-y-2">
              {flags.map((flag) => (
                <div key={flag.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Flag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{flag.flagType?.replace(/_/g, " ") ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{flag.description?.slice(0, 60) ?? "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={flag.severity} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">Open Recon Exceptions</h3>
            <Link href="/admin/reconciliation" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {exceptions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No open exceptions</p>
          ) : (
            <div className="space-y-2">
              {exceptions.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{ex.errorType?.replace(/_/g, " ") ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">Ref: {ex.ethSwitchReference ?? "—"}</p>
                    </div>
                  </div>
                  <StatusBadge status={ex.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
