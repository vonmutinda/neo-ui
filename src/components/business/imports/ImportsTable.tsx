"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getPaymentMethodLabel } from "@/lib/business-utils";
import { ImportStatusBadge } from "./ImportStatusBadge";
import type { ImportRequest, ImportStatus } from "@/lib/business-types";

type TabValue =
  | "all"
  | "draft"
  | "submitted"
  | "bank_reviewing"
  | "shipped"
  | "completed";

interface ImportsTableProps {
  imports: ImportRequest[];
  total: number;
  statusFilter: ImportStatus | undefined;
  onStatusChange: (status: ImportStatus | undefined) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 20;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "bank_reviewing", label: "In Review" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ImportsTable({
  imports,
  total,
  statusFilter,
  onStatusChange,
  page,
  onPageChange,
}: ImportsTableProps) {
  const router = useRouter();

  const activeTab: TabValue =
    statusFilter && TABS.some((t) => t.value === statusFilter)
      ? (statusFilter as TabValue)
      : "all";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleTabChange(tab: TabValue) {
    onStatusChange(tab === "all" ? undefined : (tab as ImportStatus));
    onPageChange(1);
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => handleTabChange(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
            {t.value === "all" && total > 0 && (
              <span
                className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  activeTab === "all"
                    ? "bg-background/20 text-background"
                    : "bg-foreground/10 text-foreground",
                )}
              >
                {total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[0.7fr_1fr_0.8fr_0.7fr_0.6fr_0.6fr] gap-4 px-5 py-3 bg-muted/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Import #
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Supplier
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Amount
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Method
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Status
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Date
          </span>
        </div>

        {/* Rows */}
        {imports.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No imports found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {imports.map((imp) => (
              <div
                key={imp.id}
                onClick={() => router.push(`/business/imports/${imp.id}`)}
                className="grid cursor-pointer gap-2 px-5 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[0.7fr_1fr_0.8fr_0.7fr_0.6fr_0.6fr] md:items-center md:gap-4"
              >
                {/* Import # */}
                <p className="font-mono text-sm font-medium tracking-tight">
                  {imp.importNumber}
                </p>

                {/* Supplier */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {imp.supplierName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {imp.supplierCountry}
                  </p>
                </div>

                {/* Amount */}
                <p className="font-mono text-sm font-medium tracking-tight md:text-right">
                  {formatMoney(
                    imp.proformaAmountCents,
                    imp.proformaCurrency,
                    undefined,
                    0,
                  )}
                </p>

                {/* Payment method */}
                <div>
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {getPaymentMethodLabel(imp.paymentMethod)}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <ImportStatusBadge status={imp.status} />
                </div>

                {/* Date */}
                <p className="text-sm text-muted-foreground">
                  {formatDate(imp.createdAt)}
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
    </div>
  );
}
