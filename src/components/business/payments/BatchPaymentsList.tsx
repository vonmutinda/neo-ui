"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getBatchStatusColor, getBatchStatusLabel } from "@/lib/business-utils";
import type { BatchPayment } from "@/lib/business-types";

interface BatchPaymentsListProps {
  batches: BatchPayment[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BatchPaymentsList({
  batches,
  total,
  page,
  onPageChange,
}: BatchPaymentsListProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_0.6fr_0.7fr_1fr] gap-4 px-5 py-3 bg-muted/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Name
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Total
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Items
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Status
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Created
          </span>
        </div>

        {/* Rows */}
        {batches.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No batch payments found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {batches.map((b) => (
              <div
                key={b.id}
                onClick={() => router.push(`/business/payments/${b.id}`)}
                className={cn(
                  "grid cursor-pointer gap-2 px-5 py-4 transition-colors",
                  "hover:bg-secondary/30",
                  "md:grid-cols-[1.5fr_1fr_0.6fr_0.7fr_1fr] md:items-center md:gap-4",
                )}
              >
                {/* Name */}
                <p className="truncate text-sm font-medium">{b.name}</p>

                {/* Total */}
                <p className="font-mono text-sm font-medium tracking-tight">
                  {formatMoney(b.totalCents, b.currencyCode, undefined, 0)}
                </p>

                {/* Items */}
                <p className="text-sm text-muted-foreground">{b.itemCount}</p>

                {/* Status */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      getBatchStatusColor(b.status),
                    )}
                  >
                    {getBatchStatusLabel(b.status)}
                  </span>
                </div>

                {/* Created */}
                <p className="text-sm text-muted-foreground">
                  {formatDate(b.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className={cn(
                "h-9 rounded-lg border border-input px-4 text-sm font-medium",
                "transition-colors hover:bg-secondary/60",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                "h-9 rounded-lg border border-input px-4 text-sm font-medium",
                "transition-colors hover:bg-secondary/60",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
