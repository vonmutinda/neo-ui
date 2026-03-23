"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBatchPaymentDetail,
  useApproveBatchPayment,
  useProcessBatchPayment,
} from "@/hooks/business/use-batch-payments";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { BatchProgressCard } from "@/components/business/payments/BatchProgressCard";
import { BatchMetrics } from "@/components/business/payments/BatchMetrics";
import { BatchItemsTable } from "@/components/business/payments/BatchItemsTable";
import { getBatchStatusColor, getBatchStatusLabel } from "@/lib/business-utils";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BatchPaymentDetailPage() {
  const params = useParams();
  const batchId = params.id as string;
  const { activeBusinessId } = useBusinessStore();

  const { data: batch, isLoading } = useBatchPaymentDetail(
    activeBusinessId,
    batchId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const approveMutation = useApproveBatchPayment(activeBusinessId);
  const processMutation = useProcessBatchPayment(activeBusinessId);

  const canApprove = permissions?.includes("biz:batch:approve") ?? false;
  const canExecute = permissions?.includes("biz:batch:execute") ?? false;

  function handleApprove() {
    approveMutation.mutate(batchId, {
      onSuccess: () => toast.success("Batch approved"),
      onError: () => toast.error("Failed to approve batch"),
    });
  }

  function handleProcess() {
    processMutation.mutate(batchId, {
      onSuccess: () => toast.success("Batch processing started"),
      onError: () => toast.error("Failed to process batch"),
    });
  }

  if (isLoading || !batch) {
    return (
      <div className="space-y-6">
        <PageHeader title="Batch Payment" backHref="/business/payments" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const items = batch.items ?? [];
  const showProgress =
    batch.status === "processing" ||
    batch.status === "completed" ||
    batch.status === "partial";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={batch.name}
        backHref="/business/payments"
        rightSlot={
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              getBatchStatusColor(batch.status),
            )}
          >
            {getBatchStatusLabel(batch.status)}
          </span>
        }
      />

      {/* Meta strip */}
      <div
        className={cn(
          "grid gap-4 rounded-2xl p-5 sm:grid-cols-2 lg:grid-cols-4",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-0.5 font-mono text-sm font-medium tracking-tight">
            {formatMoney(batch.totalCents, batch.currencyCode, undefined, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="mt-0.5 text-sm font-medium">{batch.itemCount}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatDate(batch.createdAt)}
            {batch.initiatedBy && (
              <span className="ml-1 text-xs">
                by {batch.initiatedBy.slice(0, 8)}
              </span>
            )}
          </p>
        </div>
        <div>
          {batch.approvedBy && (
            <>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {batch.approvedAt ? formatDate(batch.approvedAt) : "--"}
                <span className="ml-1 text-xs">
                  by {batch.approvedBy.slice(0, 8)}
                </span>
              </p>
            </>
          )}
          {batch.processedAt && !batch.approvedBy && (
            <>
              <p className="text-xs text-muted-foreground">Processed</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {formatDate(batch.processedAt)}
              </p>
            </>
          )}
          {!batch.approvedBy && !batch.processedAt && (
            <>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="mt-0.5 text-sm font-medium">{batch.currencyCode}</p>
            </>
          )}
        </div>
      </div>

      {/* Progress card */}
      {showProgress && <BatchProgressCard batch={batch} />}

      {/* Metrics */}
      {items.length > 0 && (
        <BatchMetrics items={items} currencyCode={batch.currencyCode} />
      )}

      {/* Items table */}
      {items.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Payment Items</p>
          <BatchItemsTable items={items} currencyCode={batch.currencyCode} />
        </div>
      )}

      {/* Action buttons */}
      {(batch.status === "draft" && canApprove) ||
      (batch.status === "approved" && canExecute) ? (
        <div className="flex gap-3 pt-2">
          {batch.status === "draft" && canApprove && (
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className={cn(
                "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {approveMutation.isPending ? "Approving..." : "Approve Batch"}
            </button>
          )}
          {batch.status === "approved" && canExecute && (
            <button
              onClick={handleProcess}
              disabled={processMutation.isPending}
              className={cn(
                "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {processMutation.isPending ? "Processing..." : "Process Batch"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
