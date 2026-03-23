"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateImport } from "@/hooks/business/use-imports";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateImportForm } from "@/components/business/imports/CreateImportForm";
import { ImportsSkeleton } from "@/components/business/imports/ImportsSkeleton";
import { useBusinessPermissionCheck } from "@/hooks/business/use-business-members";
import type { CreateImportRequest } from "@/lib/business-types";

export default function NewImportPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const { isChecking, allowed: canManageImports } = useBusinessPermissionCheck([
    "biz:imports:manage",
  ]);

  const createMutation = useCreateImport(activeBusinessId);

  function handleSubmit(data: CreateImportRequest) {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Import request created");
        router.push("/business/imports");
      },
      onError: () => toast.error("Failed to create import request"),
    });
  }

  if (isChecking) {
    return <ImportsSkeleton />;
  }

  if (!canManageImports) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Import" backHref="/business/imports" />
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to create import requests for this
          business.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Import" backHref="/business/imports" />
      <CreateImportForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
