"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useImportDetail,
  useSubmitImport,
  useCancelImport,
} from "@/hooks/business/use-imports";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImportDetailView } from "@/components/business/imports/ImportDetailView";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImportDetailPage() {
  const params = useParams();
  const importId = params.id as string;
  const { activeBusinessId } = useBusinessStore();

  const { data: importReq, isLoading } = useImportDetail(
    activeBusinessId,
    importId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const submitMutation = useSubmitImport(activeBusinessId);
  const cancelMutation = useCancelImport(activeBusinessId);

  const canManage = permissions?.includes("biz:imports:manage") ?? false;

  function handleSubmit() {
    submitMutation.mutate(importId, {
      onSuccess: () => toast.success("Import submitted for review"),
      onError: () => toast.error("Failed to submit import"),
    });
  }

  function handleCancel() {
    cancelMutation.mutate(importId, {
      onSuccess: () => toast.success("Import cancelled"),
      onError: () => toast.error("Failed to cancel import"),
    });
  }

  if (isLoading || !importReq) {
    return (
      <div className="space-y-6">
        <PageHeader title="Import" backHref="/business/imports" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Import" backHref="/business/imports" />
      <ImportDetailView
        importReq={importReq}
        canManage={canManage}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={submitMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
