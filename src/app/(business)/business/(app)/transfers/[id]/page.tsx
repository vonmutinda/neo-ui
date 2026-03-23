"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useBusinessTransferDetail } from "@/hooks/business/use-business-transfer-detail";
import {
  useApproveTransfer,
  useRejectTransfer,
} from "@/hooks/business/use-business-transfers";
import { useExecuteTransfer } from "@/hooks/business/use-execute-transfer";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransferDetailView } from "@/components/business/transfers/TransferDetailView";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransferDetailPage() {
  const params = useParams();
  const transferId = params.id as string;
  const { activeBusinessId } = useBusinessStore();

  const { data: transfer, isLoading } = useBusinessTransferDetail(
    activeBusinessId,
    transferId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const approveMutation = useApproveTransfer(activeBusinessId);
  const rejectMutation = useRejectTransfer(activeBusinessId);
  const executeMutation = useExecuteTransfer(activeBusinessId);

  const canApprove = permissions?.includes("biz:transfers:approve") ?? false;

  function handleApprove(id: string) {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success("Transfer approved"),
      onError: () => toast.error("Failed to approve"),
    });
  }

  function handleReject(id: string) {
    rejectMutation.mutate(
      { transferId: id, reason: "Rejected" },
      {
        onSuccess: () => toast.success("Transfer rejected"),
        onError: () => toast.error("Failed to reject"),
      },
    );
  }

  function handleExecute(id: string) {
    executeMutation.mutate(id, {
      onSuccess: () => toast.success("Transfer executed"),
      onError: () => toast.error("Failed to execute"),
    });
  }

  if (isLoading || !transfer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transfer" backHref="/business/transfers" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transfer" backHref="/business/transfers" />
      <TransferDetailView
        transfer={transfer}
        onApprove={handleApprove}
        onReject={handleReject}
        onExecute={handleExecute}
        canApprove={canApprove}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isExecuting={executeMutation.isPending}
      />
    </div>
  );
}
