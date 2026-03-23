"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminBatchPayment } from "@/hooks/admin/use-admin-batch-payments-list";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminBatchPaymentDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { data: batch, isLoading } = useAdminBatchPayment(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!batch) {
    return <p className="text-muted-foreground">Batch not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/batch-payments"
        className="text-sm text-primary hover:underline"
      >
        ← Back to batch payments
      </Link>
      <h1 className="text-2xl font-semibold">{batch.name}</h1>
      <p className="text-sm text-muted-foreground">Status: {batch.status}</p>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm space-y-2">
        <p>
          <span className="text-muted-foreground">Business:</span>{" "}
          {batch.businessId}
        </p>
        <p className="font-tabular">
          {formatMoney(
            batch.totalCents,
            batch.currencyCode as SupportedCurrency,
          )}{" "}
          · {batch.itemCount} items
        </p>
      </div>
    </div>
  );
}
