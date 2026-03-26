"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useExportDetail,
  useSubmitExport,
  useCancelExport,
} from "@/hooks/business/use-exports";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExportDetailView } from "@/components/business/exports/ExportDetailView";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExportDetailPage() {
  const params = useParams();
  const exportId = params.id as string;
  const { activeBusinessId } = useBusinessStore();

  const { data: exportReq, isLoading } = useExportDetail(
    activeBusinessId,
    exportId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const submitMutation = useSubmitExport(activeBusinessId);
  const cancelMutation = useCancelExport(activeBusinessId);

  const canManage = permissions?.includes("biz:exports:manage") ?? false;

  function handleSubmit() {
    submitMutation.mutate(exportId, {
      onSuccess: () => toast.success("Export submitted for review"),
      onError: () => toast.error("Failed to submit export"),
    });
  }

  function handleCancel() {
    cancelMutation.mutate(exportId, {
      onSuccess: () => toast.success("Export cancelled"),
      onError: () => toast.error("Failed to cancel export"),
    });
  }

  if (isLoading || !exportReq) {
    return (
      <div className="space-y-6">
        <PageHeader title="Export" backHref="/business/exports" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Export" backHref="/business/exports" />
      <ExportDetailView
        exportReq={exportReq}
        canManage={canManage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={submitMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
