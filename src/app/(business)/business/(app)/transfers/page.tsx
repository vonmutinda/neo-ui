"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { TransferStatusBadge } from "@/components/business/transfers/TransferStatusBadge";
import { TransferActions } from "@/components/business/transfers/TransferActions";
import { TransfersFilterBar } from "@/components/business/transfers/TransfersFilterBar";
import { TransfersSkeleton } from "@/components/business/transfers/TransfersSkeleton";
import type { BusinessTransferStatus } from "@/lib/business-types";

type TabValue = "all" | BusinessTransferStatus;

const PAGE_SIZE = 20;

export default function TransfersPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);

  const filter = useMemo(
    () => ({
      status: tab === "all" ? undefined : tab,
      limit: PAGE_SIZE,
      offset,
    }),
    [tab, offset],
  );

  const { data: result, isLoading } = useBusinessTransfers(
    activeBusinessId,
    filter,
  );

  // Pending count for tab badge
  const { data: pendingResult } = useBusinessTransfers(activeBusinessId, {
    status: "pending",
    limit: 1,
  });
  const pendingCount = pendingResult?.pagination?.total ?? 0;

  const approveMutation = useApproveTransfer(activeBusinessId);
  const rejectMutation = useRejectTransfer(activeBusinessId);

  const canApprove = permissions?.includes("biz:transfers:approve") ?? false;
  const canInitiateInternal =
    permissions?.includes("biz:transfers:initiate:internal") ?? false;
  const canInitiateExternal =
    permissions?.includes("biz:transfers:initiate:external") ?? false;
  const canInitiate = canInitiateInternal || canInitiateExternal;

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

  function handleExport() {
    toast.info("Export coming soon");
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (isLoading) return <TransfersSkeleton />;

  const transfers = result?.data ?? [];
  const pagination = result?.pagination;
  const totalPages = pagination ? Math.ceil(pagination.total / PAGE_SIZE) : 1;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const TABS: { value: TabValue; label: string; count?: number }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending", count: pendingCount },
    { value: "approved", label: "Approved" },
    { value: "executed", label: "Executed" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfers"
        rightSlot={
          canInitiate ? (
            <Link
              href="/business/transfers/new"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Transfer
            </Link>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTab(t.value);
              setOffset(0);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  tab === t.value
                    ? "bg-background/20 text-background"
                    : "bg-warning/10 text-warning-foreground",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <TransfersFilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setOffset(0);
        }}
        onExport={handleExport}
      />

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Header */}
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

        {/* Rows */}
        {transfers.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No transfers found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {transfers.map((t) => (
              <div
                key={t.id}
                onClick={() => router.push(`/business/transfers/${t.id}`)}
                className="grid cursor-pointer gap-2 px-5 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[1fr_1.5fr_1fr_0.8fr_0.6fr] md:items-center md:gap-4"
              >
                {/* Date */}
                <p className="text-sm text-muted-foreground">
                  {formatDate(t.createdAt)}
                </p>

                {/* Recipient */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {formatTransferRecipient(t)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatTransferSubtext(t)}
                  </p>
                </div>

                {/* Amount */}
                <p className="font-mono text-sm font-medium tracking-tight">
                  {formatMoney(t.amountCents, t.currencyCode, undefined, 0)}
                </p>

                {/* Status */}
                <div>
                  <TransferStatusBadge status={t.status} />
                </div>

                {/* Actions */}
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
              disabled={!pagination?.hasMore}
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
