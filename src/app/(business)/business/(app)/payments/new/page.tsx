"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateBatchPayment } from "@/hooks/business/use-batch-payments";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateBatchForm } from "@/components/business/payments/CreateBatchForm";
import type { CreateBatchPaymentRequest } from "@/lib/business-types";

export default function NewBatchPaymentPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const createMutation = useCreateBatchPayment(activeBusinessId);

  function handleSubmit(data: CreateBatchPaymentRequest) {
    createMutation.mutate(data, {
      onSuccess: (batch) => {
        toast.success("Batch payment created");
        router.push(`/business/payments/${batch.id}`);
      },
      onError: () => {
        toast.error("Failed to create batch payment");
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Batch Payment" backHref="/business/payments" />
      <CreateBatchForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
