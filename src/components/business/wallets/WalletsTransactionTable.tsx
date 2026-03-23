"use client";

import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BusinessTransaction,
  BusinessTransactionDirection,
} from "@/lib/business-types";

interface WalletsTransactionTableProps {
  transactions: BusinessTransaction[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  direction: BusinessTransactionDirection | undefined;
  onDirectionChange: (dir: BusinessTransactionDirection | undefined) => void;
}

const TABS: {
  label: string;
  value: BusinessTransactionDirection | undefined;
}[] = [
  { label: "All", value: undefined },
  { label: "In", value: "in" },
  { label: "Out", value: "out" },
  { label: "FX", value: "fx" },
];

const PAGE_SIZE = 20;

function TxIcon({ direction }: { direction: BusinessTransactionDirection }) {
  if (direction === "in") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success-foreground">
        <ArrowDownLeft className="h-4 w-4" />
      </span>
    );
  }
  if (direction === "fx") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ArrowLeftRight className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ArrowUpRight className="h-4 w-4" />
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WalletsTransactionTable({
  transactions,
  total,
  page,
  onPageChange,
  direction,
  onDirectionChange,
}: WalletsTransactionTableProps) {
  const start = page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, total);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div
      className={cn(
        "rounded-2xl bg-background p-6",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      {/* Section heading */}
      <h2 className="text-base font-semibold tracking-tight">Transactions</h2>

      {/* Segmented tabs */}
      <div className="mt-4 inline-flex rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => onDirectionChange(tab.value)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              direction === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-5">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-2 pb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Transaction
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Amount
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-24 text-right">
            Date
          </span>
        </div>

        {/* Rows */}
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-2 py-3"
              >
                {/* Transaction info */}
                <div className="flex items-center gap-3 min-w-0">
                  <TxIcon direction={tx.direction} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {tx.counterpartyName || tx.narration || tx.type}
                    </p>
                    {tx.category && (
                      <p className="truncate text-xs text-muted-foreground">
                        {tx.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <span
                  className={cn(
                    "font-mono text-sm font-medium tracking-tight text-right whitespace-nowrap",
                    tx.direction === "in" && "text-success-foreground",
                    tx.direction === "out" && "text-destructive",
                  )}
                >
                  {tx.direction === "in"
                    ? "+"
                    : tx.direction === "out"
                      ? "-"
                      : ""}
                  {formatMoney(tx.amountCents, tx.currencyCode, undefined, 0)}
                </span>

                {/* Date */}
                <span className="w-24 text-right text-xs text-muted-foreground">
                  {formatDate(tx.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {start}&ndash;{end} of {total}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                page === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-muted",
              )}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                page >= totalPages - 1
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-muted",
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
