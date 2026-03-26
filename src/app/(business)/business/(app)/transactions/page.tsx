"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import {
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
} from "lucide-react";
import { useBusinessStore } from "@/providers/business-store";
import { useBusinessTransactions } from "@/hooks/business/use-business-transactions";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import type { BusinessTransactionDirection } from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

const DIRECTION_TABS: {
  label: string;
  value: BusinessTransactionDirection | undefined;
}[] = [
  { label: "All", value: undefined },
  { label: "Inbound", value: "in" },
  { label: "Outbound", value: "out" },
  { label: "FX", value: "fx" },
];

const CURRENCIES: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

const PAGE_SIZE = 25;

function TxIcon({ direction }: { direction: BusinessTransactionDirection }) {
  if (direction === "in") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success-foreground">
        <ArrowDownLeft className="h-4 w-4" />
      </span>
    );
  }
  if (direction === "fx") {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ArrowLeftRight className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ArrowUpRight className="h-4 w-4" />
    </span>
  );
}

export default function TransactionsPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [direction, setDirection] = useState<
    BusinessTransactionDirection | undefined
  >();
  const [currency, setCurrency] = useState<SupportedCurrency | "">("");
  const [page, setPage] = useState(0);

  const filter = useMemo(
    () => ({
      direction,
      currency: currency || undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [direction, currency, page],
  );

  const { data: result, isLoading } = useBusinessTransactions(
    activeBusinessId,
    filter,
  );

  const canExport = permissions?.includes("biz:transactions:export") ?? false;

  const transactions = result?.data ?? [];
  const total = result?.pagination?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        rightSlot={
          canExport ? (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/v1/business/${activeBusinessId}/wallets/transactions/export`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-muted px-4 text-sm font-medium",
                "transition-colors hover:bg-muted/80",
              )}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </a>
          ) : undefined
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Direction tabs */}
        <div className="inline-flex rounded-lg bg-muted p-1">
          {DIRECTION_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setDirection(tab.value);
                setPage(0);
              }}
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

        {/* Currency filter */}
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value as SupportedCurrency | "");
            setPage(0);
          }}
          className={cn(
            "h-9 rounded-lg bg-muted px-3 text-sm font-medium outline-none",
            "focus:ring-2 focus:ring-foreground/20",
          )}
        >
          <option value="">All currencies</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction table */}
      <div
        className={cn(
          "rounded-2xl bg-card",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-3 border-b">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Transaction
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Amount
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-28 text-right">
            Date
          </span>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="space-y-0 divide-y divide-border/40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] gap-4 px-6 py-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TxIcon
                    direction={
                      tx.amountCents >= 0
                        ? "in"
                        : tx.amountCents < 0
                          ? "out"
                          : "fx"
                    }
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {tx.counterpartyName || tx.narration || tx.type}
                    </p>
                    {tx.narration && tx.counterpartyName && (
                      <p className="truncate text-xs text-muted-foreground">
                        {tx.narration}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={cn(
                    "font-mono text-sm font-medium tracking-tight text-right whitespace-nowrap",
                    tx.amountCents > 0 && "text-success-foreground",
                    tx.amountCents < 0 && "text-destructive",
                  )}
                >
                  {tx.amountCents > 0 ? "+" : tx.amountCents < 0 ? "-" : ""}
                  {formatMoney(
                    Math.abs(tx.amountCents),
                    tx.currency,
                    undefined,
                    0,
                  )}
                </span>

                <span className="w-28 text-right text-xs text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-3 text-sm text-muted-foreground">
            <span>
              {page * PAGE_SIZE + 1}&ndash;
              {Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  page === 0
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-muted",
                )}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
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
    </div>
  );
}
