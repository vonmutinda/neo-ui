"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Layers, Check, X } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { formatTransferRecipient } from "@/lib/business-utils";
import { cn } from "@/lib/utils";
import type { BusinessTransfer } from "@/lib/business-types";

interface BusinessPendingApprovalsProps {
  transfers: BusinessTransfer[];
  totalPending: number;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function BusinessPendingApprovals({
  transfers,
  totalPending,
  onApprove,
  onReject,
}: BusinessPendingApprovalsProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-background",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight">
          Needs Approval
        </h2>
        {totalPending > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-warning/10 px-2 text-xs font-semibold text-warning-foreground">
            {totalPending}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        {transfers.map((t) => {
          const isBatch = t.transferType.includes("batch");
          return (
            <div
              key={t.id}
              className="flex items-center gap-3.5 border-b border-border/40 px-6 py-4 last:border-b-0 transition-colors hover:bg-secondary/30"
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  isBatch
                    ? "bg-primary/10 text-primary"
                    : "bg-warning/10 text-warning-foreground",
                )}
              >
                {isBatch ? (
                  <Layers className="h-[18px] w-[18px]" />
                ) : (
                  <ArrowUpRight className="h-[18px] w-[18px]" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {formatTransferRecipient(t)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(t.createdAt)}
                </p>
              </div>

              {/* Amount */}
              <p className="shrink-0 font-mono text-sm font-semibold tracking-tight">
                {formatMoney(t.amountCents, t.currencyCode, undefined, 0)}
              </p>

              {/* Actions */}
              {(onApprove || onReject) && (
                <div className="flex shrink-0 gap-1.5">
                  {onApprove && (
                    <button
                      type="button"
                      onClick={() => onApprove(t.id)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        "bg-success/10 text-success-foreground",
                        "transition-all hover:bg-success hover:text-white",
                        "active:scale-90",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  {onReject && (
                    <button
                      type="button"
                      onClick={() => onReject(t.id)}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        "bg-destructive/8 text-destructive",
                        "transition-all hover:bg-destructive hover:text-white",
                        "active:scale-90",
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {transfers.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            Nothing pending
          </div>
        )}
      </div>

      {totalPending > transfers.length && (
        <div className="border-t border-border/40 px-6 py-3.5">
          <Link
            href="/business/transfers?status=pending"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See all {totalPending} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
