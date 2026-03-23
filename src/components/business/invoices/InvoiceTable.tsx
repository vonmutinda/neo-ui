"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { Invoice, InvoiceStatus } from "@/lib/business-types";

type TabValue = "all" | "draft" | "sent" | "paid" | "overdue";

interface InvoiceTableProps {
  invoices: Invoice[];
  total: number;
  statusFilter: InvoiceStatus | undefined;
  onStatusChange: (status: InvoiceStatus | undefined) => void;
  page: number;
  onPageChange: (page: number) => void;
}

const PAGE_SIZE = 20;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDueDateClass(dueDate: string, status: InvoiceStatus): string {
  if (status === "paid" || status === "cancelled")
    return "text-muted-foreground";

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "text-destructive font-medium";
  if (diffDays <= 7) return "text-warning-foreground font-medium";
  return "text-muted-foreground";
}

function getPaidPercent(invoice: Invoice): number {
  if (invoice.totalCents === 0) return 0;
  return Math.min(
    100,
    Math.round((invoice.paidCents / invoice.totalCents) * 100),
  );
}

export function InvoiceTable({
  invoices,
  total,
  statusFilter,
  onStatusChange,
  page,
  onPageChange,
}: InvoiceTableProps) {
  const router = useRouter();

  const activeTab: TabValue =
    statusFilter && ["draft", "sent", "paid", "overdue"].includes(statusFilter)
      ? (statusFilter as TabValue)
      : "all";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleTabChange(tab: TabValue) {
    onStatusChange(tab === "all" ? undefined : tab);
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
        <div className="hidden md:grid md:grid-cols-[0.8fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr] gap-4 px-5 py-3 bg-muted/30">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Invoice #
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Customer
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Amount
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Paid
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Status
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Due
          </span>
        </div>

        {/* Rows */}
        {invoices.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            No invoices found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {invoices.map((inv) => {
              const paidPct = getPaidPercent(inv);

              return (
                <div
                  key={inv.id}
                  onClick={() => router.push(`/business/invoices/${inv.id}`)}
                  className="grid cursor-pointer gap-2 px-5 py-4 transition-colors hover:bg-secondary/30 md:grid-cols-[0.8fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr] md:items-center md:gap-4"
                >
                  {/* Invoice # */}
                  <p className="font-mono text-sm font-medium tracking-tight">
                    {inv.invoiceNumber}
                  </p>

                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {inv.customerName}
                    </p>
                    {inv.customerEmail && (
                      <p className="truncate text-xs text-muted-foreground">
                        {inv.customerEmail}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <p className="font-mono text-sm font-medium tracking-tight md:text-right">
                    {formatMoney(
                      inv.totalCents,
                      inv.currencyCode,
                      undefined,
                      0,
                    )}
                  </p>

                  {/* Paid progress */}
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          paidPct === 100
                            ? "bg-success-foreground"
                            : paidPct > 0
                              ? "bg-warning-foreground"
                              : "bg-muted-foreground/30",
                        )}
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {paidPct}%
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <InvoiceStatusBadge status={inv.status} />
                  </div>

                  {/* Due date */}
                  <p
                    className={cn(
                      "text-sm",
                      getDueDateClass(inv.dueDate, inv.status),
                    )}
                  >
                    {formatDate(inv.dueDate)}
                  </p>
                </div>
              );
            })}
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
