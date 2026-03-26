"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateExport } from "@/hooks/business/use-exports";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateExportForm } from "@/components/business/exports/CreateExportForm";
import { ExportsSkeleton } from "@/components/business/exports/ExportsSkeleton";
import { useBusinessPermissionCheck } from "@/hooks/business/use-business-members";
import type { CreateExportRequest } from "@/lib/business-types";

export default function NewExportPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const { isChecking, allowed: canManageExports } = useBusinessPermissionCheck([
    "biz:exports:manage",
  ]);

  const createMutation = useCreateExport(activeBusinessId);

  function handleSubmit(data: CreateExportRequest) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Export request created");
        router.push("/business/exports");
      },
      onError: () => toast.error("Failed to create export request"),
    });
  }

  if (isChecking) {
    return <ExportsSkeleton />;
  }

  if (!canManageExports) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Export" backHref="/business/exports" />
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to create export requests for this
          business.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Export" backHref="/business/exports" />
      <CreateExportForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
