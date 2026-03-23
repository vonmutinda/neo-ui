"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  getBatchItemStatusColor,
  getBatchItemStatusLabel,
} from "@/lib/business-utils";
import type { BatchPaymentItem } from "@/lib/business-types";

interface BatchItemsTableProps {
  items: BatchPaymentItem[];
  currencyCode: string;
}

const PAGE_SIZE = 20;

export function BatchItemsTable({ items, currencyCode }: BatchItemsTableProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[0.3fr_1.5fr_1fr_1fr_0.7fr_0.8fr] gap-4 px-5 py-3 bg-muted/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            #
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Recipient
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Bank / Phone
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Amount
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Status
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Ref
          </span>
        </div>

        {/* Rows */}
        {visible.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No items
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {visible.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  "grid gap-2 px-5 py-4",
                  "md:grid-cols-[0.3fr_1.5fr_1fr_1fr_0.7fr_0.8fr] md:items-center md:gap-4",
                )}
              >
                {/* Row number */}
                <p className="text-xs text-muted-foreground">
                  {start + idx + 1}
                </p>

                {/* Recipient */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.recipientName}
                  </p>
                  {item.status === "failed" && item.errorMessage && (
                    <p className="mt-0.5 truncate text-xs text-red-500">
                      {item.errorMessage}
                    </p>
                  )}
                  {item.narration && item.status !== "failed" && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.narration}
                    </p>
                  )}
                </div>

                {/* Bank / Phone */}
                <p className="truncate text-sm text-muted-foreground">
                  {item.recipientBank
                    ? `${item.recipientBank} ${item.recipientAccount ? `****${item.recipientAccount.slice(-4)}` : ""}`
                    : (item.recipientPhone ?? "--")}
                </p>

                {/* Amount */}
                <p className="font-mono text-sm font-medium tracking-tight">
                  {formatMoney(item.amountCents, currencyCode, undefined, 0)}
                </p>

                {/* Status */}
                <div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      getBatchItemStatusColor(item.status),
                    )}
                  >
                    {getBatchItemStatusLabel(item.status)}
                  </span>
                </div>

                {/* Ref */}
                <p className="truncate text-xs text-muted-foreground">
                  {item.transactionId ? item.transactionId.slice(0, 8) : "--"}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
