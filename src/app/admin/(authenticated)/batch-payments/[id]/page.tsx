"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminBatchPayment } from "@/hooks/admin/use-admin-batch-payments-list";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminBatchPaymentDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { data, isLoading } = useAdminBatchPayment(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const batch = data?.batch;
  const items = data?.items ?? [];

  if (!batch) {
    return <p className="text-muted-foreground">Batch not found.</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/batch-payments"
        className="text-sm text-primary hover:underline"
      >
        &larr; Back to batch payments
      </Link>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{batch.name}</h1>
        <StatusBadge status={batch.status} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 text-sm space-y-2">
        <p>
          <span className="text-muted-foreground">Business:</span>{" "}
          {batch.businessId}
        </p>
        <p className="font-tabular">
          {formatMoney(
            batch.totalCents,
            batch.currencyCode as SupportedCurrency,
          )}{" "}
          &middot; {batch.itemCount} items
        </p>
        {batch.createdAt && (
          <p>
            <span className="text-muted-foreground">Created:</span>{" "}
            {new Date(batch.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Items</h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Recipient</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Narration</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{item.recipientName}</td>
                    <td className="px-4 py-3 font-tabular">
                      {formatMoney(
                        item.amountCents,
                        batch.currencyCode as SupportedCurrency,
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.narration ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
