"use client";

import { useAuthStore } from "@/providers/auth-store";
import { useBusinessStore } from "@/providers/business-store";
import { useBusinessWalletSummary } from "@/hooks/business/use-business-wallets";
import { useBusinessTransfers } from "@/hooks/business/use-business-transfers";
import {
  useApproveTransfer,
  useRejectTransfer,
} from "@/hooks/business/use-business-transfers";
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
