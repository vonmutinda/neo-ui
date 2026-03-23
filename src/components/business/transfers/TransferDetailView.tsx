"use client";

import {
  Clock,
  Check,
  X,
  Send,
  ArrowUpRight,
  Building2,
  User,
  AlertTriangle,
  Loader2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  formatTransferRecipient,
  formatTransferSubtext,
  getTransferTypeLabel,
  PURPOSE_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/lib/business-utils";
import { TransferStatusBadge } from "./TransferStatusBadge";
import type { BusinessTransfer } from "@/lib/business-types";

interface TransferDetailViewProps {
  transfer: BusinessTransfer;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onExecute?: (id: string) => void;
  canApprove: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  isExecuting?: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface TimelineEvent {
  icon: typeof Clock;
  iconBg: string;
  label: string;
  timestamp: string;
  actor?: string;
  detail?: string;
}

function buildTimeline(transfer: BusinessTransfer): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      icon: Send,
      iconBg: "bg-primary/10 text-primary",
      label: "Initiated",
      timestamp: transfer.createdAt,
      actor: transfer.initiatedBy,
    },
  ];

  if (transfer.approvedAt) {
    events.push({
      icon: Check,
      iconBg: "bg-success/10 text-success-foreground",
      label: "Approved",
      timestamp: transfer.approvedAt,
      actor: transfer.approvedBy,
    });
  }

  if (transfer.rejectedAt) {
    events.push({
      icon: X,
      iconBg: "bg-destructive/10 text-destructive",
      label: "Rejected",
      timestamp: transfer.rejectedAt,
      actor: transfer.rejectedBy,
      detail: transfer.reason,
    });
  }

  if (transfer.executedAt) {
    events.push({
      icon: ArrowUpRight,
      iconBg: "bg-success/10 text-success-foreground",
      label: "Executed",
      timestamp: transfer.executedAt,
    });
  }

  if (transfer.failedAt) {
    events.push({
      icon: AlertTriangle,
      iconBg: "bg-destructive/10 text-destructive",
      label: "Failed",
      timestamp: transfer.failedAt,
      detail: transfer.failureReason,
    });
  }

  return events;
}

export function TransferDetailView({
  transfer,
  onApprove,
  onReject,
  onExecute,
  canApprove,
  isApproving = false,
  isRejecting = false,
  isExecuting = false,
}: TransferDetailViewProps) {
  const timeline = buildTimeline(transfer);
  const recipientInfo = transfer.recipientInfo;
  const narration =
    typeof recipientInfo === "object"
      ? (recipientInfo?.narration as string)
      : undefined;
  const purposeVal =
    typeof recipientInfo === "object"
      ? (recipientInfo?.purpose as string)
      : undefined;
  const categoryVal =
    typeof recipientInfo === "object"
      ? (recipientInfo?.category as string)
      : undefined;
  const purposeLabel = PURPOSE_OPTIONS.find(
    (o) => o.value === purposeVal,
  )?.label;
  const categoryLabel = CATEGORY_OPTIONS.find(
    (o) => o.value === categoryVal,
  )?.label;

  const busy = isApproving || isRejecting || isExecuting;
  const showApproveReject =
    transfer.status === "pending" && canApprove && onApprove && onReject;
  const showExecute = transfer.status === "approved" && canApprove && onExecute;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <p className="font-mono text-3xl font-semibold tracking-tight">
          {formatMoney(
            transfer.amountCents,
            transfer.currencyCode,
            undefined,
            0,
          )}
        </p>
        <TransferStatusBadge status={transfer.status} />
        <p className="text-sm text-muted-foreground">
          {formatTransferRecipient(transfer)}
        </p>
      </div>

      {/* Timeline */}
      <div
        className={cn(
          "rounded-2xl px-6 py-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Timeline
        </p>
        <div className="relative space-y-0">
          {timeline.map((event, idx) => {
            const Icon = event.icon;
            const isLast = idx === timeline.length - 1;

            return (
              <div key={idx} className="flex gap-3.5">
                {/* Vertical line + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      event.iconBg,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>

                {/* Content */}
                <div className={cn("pb-5", isLast && "pb-0")}>
                  <p className="text-sm font-semibold">{event.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.timestamp)}
                  </p>
                  {event.actor && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      by {event.actor}
                    </p>
                  )}
                  {event.detail && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details card */}
      <div
        className={cn(
          "divide-y divide-border/40 rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Details
          </p>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-xs text-muted-foreground">Type</p>
          <div className="mt-0.5 flex items-center gap-2 text-sm font-medium">
            {transfer.transferType === "internal" ? (
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {getTransferTypeLabel(
              transfer.transferType as "internal" | "external",
            )}
          </div>
        </div>

        <div className="px-5 py-3.5">
          <p className="text-xs text-muted-foreground">Recipient</p>
          <p className="mt-0.5 text-sm font-medium">
            {formatTransferRecipient(transfer)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatTransferSubtext(transfer)}
          </p>
        </div>

        {transfer.transactionId && (
          <div className="px-5 py-3.5">
            <p className="text-xs text-muted-foreground">Transaction ID</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {transfer.transactionId}
            </p>
          </div>
        )}

        {narration && (
          <div className="px-5 py-3.5">
            <p className="text-xs text-muted-foreground">Narration</p>
            <p className="mt-0.5 text-sm">{narration}</p>
          </div>
        )}

        {purposeLabel && (
          <div className="px-5 py-3.5">
            <p className="text-xs text-muted-foreground">Purpose</p>
            <p className="mt-0.5 text-sm">{purposeLabel}</p>
          </div>
        )}

        {categoryLabel && (
          <div className="px-5 py-3.5">
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="mt-0.5 text-sm">{categoryLabel}</p>
          </div>
        )}

        <div className="px-5 py-3.5">
          <p className="text-xs text-muted-foreground">Expires at</p>
          <p className="mt-0.5 text-sm">{formatDateTime(transfer.expiresAt)}</p>
        </div>
      </div>

      {/* Action buttons */}
      {(showApproveReject || showExecute) && (
        <div className="flex items-center gap-3">
          {showApproveReject && (
            <>
              <button
                onClick={() => onReject!(transfer.id)}
                disabled={busy}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-medium text-destructive",
                  "transition-colors hover:bg-destructive/10 active:bg-destructive/20",
                  "disabled:opacity-40 disabled:pointer-events-none",
                )}
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => onApprove!(transfer.id)}
                disabled={busy}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background",
                  "transition-opacity hover:opacity-90 active:opacity-80",
                  "disabled:opacity-40 disabled:pointer-events-none",
                )}
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Approve
              </button>
            </>
          )}

          {showExecute && (
            <button
              onClick={() => onExecute!(transfer.id)}
              disabled={busy}
              className={cn(
                "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Execute
            </button>
          )}
        </div>
      )}
    </div>
  );
}
