"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateImport } from "@/hooks/business/use-imports";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateImportForm } from "@/components/business/imports/CreateImportForm";
import type { CreateImportRequest } from "@/lib/business-types";

export default function NewImportPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();

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
