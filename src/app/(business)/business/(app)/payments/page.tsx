"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  formatTransferRecipient,
  formatTransferSubtext,
} from "@/lib/business-utils";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBusinessTransfers,
  useApproveTransfer,
  useRejectTransfer,
} from "@/hooks/business/use-business-transfers";
import { useBatchPayments } from "@/hooks/business/use-batch-payments";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransferStatusBadge } from "@/components/business/transfers/TransferStatusBadge";
import { TransferActions } from "@/components/business/transfers/TransferActions";
import { BatchPaymentsList } from "@/components/business/payments/BatchPaymentsList";
import type {
  BusinessTransferStatus,
  BatchPaymentStatus,
} from "@/lib/business-types";

type ViewType = "transfers" | "batch";

const PAGE_SIZE = 20;

export default function PaymentsPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [view, setView] = useState<ViewType>("transfers");
  const [transferTab, setTransferTab] = useState<
    "all" | BusinessTransferStatus
  >("all");
  const [batchTab, setBatchTab] = useState<"all" | BatchPaymentStatus>("all");
  const [offset, setOffset] = useState(0);
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Transfer data
  const transferFilter = useMemo(
    () => ({
      status: transferTab === "all" ? undefined : transferTab,
      limit: PAGE_SIZE,
      offset: view === "transfers" ? offset : 0,
    }),
    [transferTab, offset, view],
  );
  const { data: transferResult, isLoading: transfersLoading } =
    useBusinessTransfers(activeBusinessId, transferFilter);

  // Pending count for badge
  const { data: pendingResult } = useBusinessTransfers(activeBusinessId, {
    status: "pending",
    limit: 1,
  });
  const pendingCount = pendingResult?.pagination?.total ?? 0;

  // Batch data
  const batchFilter = useMemo(
    () => ({
      status: batchTab === "all" ? undefined : batchTab,
      limit: PAGE_SIZE,
      offset: view === "batch" ? offset : 0,
    }),
    [batchTab, offset, view],
  );
  const { data: batchResult, isLoading: batchLoading } = useBatchPayments(
    activeBusinessId,
    batchFilter,
  );

  const approveMutation = useApproveTransfer(activeBusinessId);
  const rejectMutation = useRejectTransfer(activeBusinessId);

  const canApprove = permissions?.includes("biz:transfers:approve") ?? false;
  const canInitiateInternal =
    permissions?.includes("biz:transfers:initiate:internal") ?? false;
  const canInitiateExternal =
    permissions?.includes("biz:transfers:initiate:external") ?? false;
  const canInitiate = canInitiateInternal || canInitiateExternal;
  const canCreateBatch = permissions?.includes("biz:batch:create") ?? false;

  function handleApprove(id: string) {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success("Transfer approved"),
      onError: () => toast.error("Failed to approve"),
    });
  }

  function handleReject(id: string) {
    rejectMutation.mutate(
      { transferId: id, reason: "Rejected" },
      {
        onSuccess: () => toast.success("Transfer rejected"),
        onError: () => toast.error("Failed to reject"),
      },
    );
  }

  const TRANSFER_TABS: {
    value: "all" | BusinessTransferStatus;
    label: string;
    count?: number;
  }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending", count: pendingCount },
    { value: "approved", label: "Approved" },
    { value: "executed", label: "Executed" },
    { value: "rejected", label: "Rejected" },
  ];

  const BATCH_TABS: { value: "all" | BatchPaymentStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "approved", label: "Approved" },
    { value: "processing", label: "Processing" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  const isLoading = view === "transfers" ? transfersLoading : batchLoading;
  const transfers = transferResult?.data ?? [];
  const batches = batchResult?.data ?? [];
  const transferTotal = transferResult?.pagination?.total ?? 0;
  const batchTotal = batchResult?.pagination?.total ?? 0;
  const total = view === "transfers" ? transferTotal : batchTotal;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        rightSlot={
          canInitiate || canCreateBatch ? (
            <div className="relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                  "transition-opacity hover:opacity-90 active:opacity-80",
                )}
              >
                <Plus className="h-4 w-4" />
                New Payment
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showNewMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNewMenu(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-48 rounded-xl bg-card p-1 shadow-lg border">
                    {canInitiate && (
                      <Link
                        href="/business/payments/transfers/new"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowNewMenu(false)}
                      >
                        Transfer
                      </Link>
                    )}
                    {canCreateBatch && (
                      <Link
                        href="/business/payments/new"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => setShowNewMenu(false)}
                      >
                        Batch Payment
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : undefined
        }
      />

      {/* View type toggle */}
      <div className="inline-flex rounded-lg bg-muted p-1">
        <button
          onClick={() => {
            setView("transfers");
            setOffset(0);
          }}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            view === "transfers"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Transfers
          {pendingCount > 0 && view !== "transfers" && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/10 px-1.5 text-[11px] font-semibold text-warning-foreground">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setView("batch");
            setOffset(0);
          }}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            view === "batch"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Batch Payments
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {(view === "transfers" ? TRANSFER_TABS : BATCH_TABS).map((t) => (
          <button
            key={t.value}
            onClick={() => {
              if (view === "transfers")
                setTransferTab(t.value as "all" | BusinessTransferStatus);
              else setBatchTab(t.value as "all" | BatchPaymentStatus);
              setOffset(0);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              (view === "transfers" ? transferTab : batchTab) === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
            {"count" in t &&
              t.count !== undefined &&
              (t.count as number) > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                    (view === "transfers" ? transferTab : batchTab) === t.value
                      ? "bg-background/20 text-background"
                      : "bg-warning/10 text-warning-foreground",
                  )}
                >
                  {(t as { count?: number }).count}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted" />
          ))}
        </div>
      ) : view === "transfers" ? (
        /* Transfers table */
        <div
          className={cn(
            "overflow-hidden rounded-2xl",
            "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          )}
        >
          <div className="hidden md:grid md:grid-cols-[1fr_1.5fr_1fr_0.8fr_0.6fr] gap-4 px-5 py-3 bg-muted/30">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Date
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Recipient
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Amount
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Status
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Actions
            </span>
          </div>

          {transfers.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No transfers found
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {transfers.map((t) => (
                <div
                  key={t.id}
                  onClick={() =>
                    router.push(`/business/payments/transfers/${t.id}`)
                  }
                  className="grid cursor-pointer gap-2 px-5 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[1fr_1.5fr_1fr_0.8fr_0.6fr] md:items-center md:gap-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatTransferRecipient(t)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatTransferSubtext(t)}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-medium tracking-tight">
                    {formatMoney(t.amountCents, t.currencyCode, undefined, 0)}
                  </p>
                  <div>
                    <TransferStatusBadge status={t.status} />
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {t.status === "pending" && canApprove ? (
                      <TransferActions
                        transferId={t.id}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        isApproving={approveMutation.isPending}
                        isRejecting={rejectMutation.isPending}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Batch payments table */
        <BatchPaymentsList
          batches={batches}
          total={batchTotal}
          page={currentPage}
          onPageChange={(p) => setOffset((p - 1) * PAGE_SIZE)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className={cn(
                "h-9 rounded-lg border border-input px-4 text-sm font-medium",
                "transition-colors hover:bg-secondary/60",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={currentPage >= totalPages}
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
    </div>
  );
}
