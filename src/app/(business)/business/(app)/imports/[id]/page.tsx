"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useImportDetail,
  useSubmitImport,
  useCancelImport,
  useUpdateImport,
} from "@/hooks/business/use-imports";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImportDetailView } from "@/components/business/imports/ImportDetailView";
import { CreateImportForm } from "@/components/business/imports/CreateImportForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateImportRequest } from "@/lib/business-types";

export default function ImportDetailPage() {
  const params = useParams();
  const importId = params.id as string;
  const { activeBusinessId } = useBusinessStore();
  const [isEditing, setIsEditing] = useState(false);

  const { data: importReq, isLoading } = useImportDetail(
    activeBusinessId,
    importId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const submitMutation = useSubmitImport(activeBusinessId);
  const cancelMutation = useCancelImport(activeBusinessId);
  const updateMutation = useUpdateImport(activeBusinessId);

  const canManage = permissions?.includes("biz:imports:manage") ?? false;
  const canEdit = canManage && importReq?.status === "draft";

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

  function handleUpdate(data: CreateImportRequest) {
    updateMutation.mutate(
      { importId, body: data },
      {
        onSuccess: () => {
          toast.success("Import updated");
          setIsEditing(false);
        },
        onError: () => toast.error("Failed to update import"),
      },
    );
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

  if (isEditing) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Import" backHref="/business/imports" />
        <CreateImportForm
          onSubmit={handleUpdate}
          isSubmitting={updateMutation.isPending}
          initialData={{
            supplierName: importReq.supplierName,
            supplierCountry: importReq.supplierCountry,
            goodsDescription: importReq.goodsDescription,
            hsCode: importReq.hsCode,
            proformaAmountCents: importReq.proformaAmountCents,
            proformaCurrency: importReq.proformaCurrency,
            paymentMethod: importReq.paymentMethod ?? undefined,
            insuranceAmountCents: importReq.insuranceAmountCents ?? undefined,
            insuranceProvider: importReq.insuranceProvider,
            portOfEntry: importReq.portOfEntry,
            expectedArrivalDate: importReq.expectedArrivalDate,
          }}
          submitLabel="Save Changes"
          onCancel={() => setIsEditing(false)}
        />
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
        onEdit={canEdit ? () => setIsEditing(true) : undefined}
        isSubmitting={submitMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
