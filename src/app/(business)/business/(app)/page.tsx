"use client";

import { useAuthStore } from "@/providers/auth-store";
import { useBusinessStore } from "@/providers/business-store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import { useBusinessWalletSummary } from "@/hooks/business/use-business-wallets";
import { useBusinessTransfers } from "@/hooks/business/use-business-transfers";
import {
  useApproveTransfer,
  useRejectTransfer,
} from "@/hooks/business/use-business-transfers";
import { useBusinessPotSummary } from "@/hooks/business/use-business-pots";
import { BusinessHeroBalance } from "@/components/business/dashboard/BusinessHeroBalance";
import { BusinessQuickActions } from "@/components/business/dashboard/BusinessQuickActions";
import { BusinessCurrencyCards } from "@/components/business/dashboard/BusinessCurrencyCards";
import { BusinessRecentTransfers } from "@/components/business/dashboard/BusinessRecentTransfers";
import { BusinessPendingApprovals } from "@/components/business/dashboard/BusinessPendingApprovals";
import { BusinessDashboardSkeleton } from "@/components/business/dashboard/BusinessDashboardSkeleton";
import { toast } from "sonner";
import { useMyPermissions } from "@/hooks/business/use-business-members";

export default function BusinessDashboardPage() {
  const userProfile = useAuthStore((s) => s.userProfile);
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);
  const canApproveTransfer =
    permissions?.includes("biz:transfers:approve") ?? false;

  const { data: walletSummary, isLoading } =
    useBusinessWalletSummary(activeBusinessId);

  const { data: recentResult } = useBusinessTransfers(activeBusinessId, {
    limit: 5,
  });

  const { data: pendingResult } = useBusinessTransfers(activeBusinessId, {
    status: "pending",
    limit: 5,
  });

  const { data: potSummary } = useBusinessPotSummary(activeBusinessId);

  const approveMutation = useApproveTransfer(activeBusinessId);
  const rejectMutation = useRejectTransfer(activeBusinessId);

  function handleApprove(transferId: string) {
    approveMutation.mutate(transferId, {
      onSuccess: () => toast.success("Transfer approved"),
      onError: () => toast.error("Failed to approve"),
    });
  }

  function handleReject(transferId: string) {
    rejectMutation.mutate(
      { transferId, reason: "Rejected from dashboard" },
      {
        onSuccess: () => toast.success("Transfer rejected"),
        onError: () => toast.error("Failed to reject"),
      },
    );
  }

  if (isLoading || !walletSummary) {
    return <BusinessDashboardSkeleton />;
  }

  const balances = walletSummary.balances;
  const primaryCurrency =
    balances.find((b) => b.isPrimary)?.currencyCode ?? "ETB";

  return (
    <div>
      {/* Hero Balance */}
      <BusinessHeroBalance
        firstName={userProfile?.firstName}
        totalCents={walletSummary.totalHomeCurrencyCents}
        primaryCurrency={primaryCurrency}
        currencyCount={balances.length}
        kybLevel={activeBusiness?.kybLevel ?? 0}
      />

      {/* Quick Actions */}
      <BusinessQuickActions permissions={permissions} />

      {/* Currency Cards */}
      <BusinessCurrencyCards balances={balances} />

      {/* Pots Summary */}
      {potSummary && potSummary.length > 0 && (
        <div
          className={cn(
            "mt-5 rounded-2xl bg-card p-5",
            "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Pots</h2>
            <Link
              href="/business/pots"
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {potSummary.slice(0, 4).map((pot) => (
              <Link
                key={pot.id}
                href={`/business/pots/${pot.id}`}
                className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3 transition-colors hover:bg-secondary"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pot.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {pot.category.replace("_", " ")}
                  </p>
                </div>
                <p className="font-mono text-sm font-semibold whitespace-nowrap">
                  {pot.display ||
                    formatMoney(
                      pot.balanceCents,
                      pot.currencyCode,
                      undefined,
                      0,
                    )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two Column: Recent + Approvals */}
      <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <BusinessRecentTransfers transfers={recentResult?.data ?? []} />
        <BusinessPendingApprovals
          transfers={pendingResult?.data ?? []}
          totalPending={pendingResult?.pagination?.total ?? 0}
          onApprove={canApproveTransfer ? handleApprove : undefined}
          onReject={canApproveTransfer ? handleReject : undefined}
        />
      </div>
    </div>
  );
}
