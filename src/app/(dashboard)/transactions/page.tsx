"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  X,
  CreditCard,
  Building2,
  HandCoins,
  Receipt,
  CircleDollarSign,
  Banknote,
  Users,
  PiggyBank,
  Wallet,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTransactions } from "@/hooks/use-wallets";
import { useBalances } from "@/hooks/use-balances";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  SupportedCurrency,
  TransactionReceipt,
  ReceiptType,
  PaymentRequest,
} from "@/lib/types";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import {
  useReceivedRequests,
  useSentRequests,
} from "@/hooks/use-payment-requests";

const CURRENCY_ORDER: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];
const PAGE_SIZE = 20;

const CREDIT_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
  "loan_disbursement",
  "convert_in",
  "pot_withdraw",
  "business_transfer_in",
]);

type InflowOverdraftMetadata = {
  totalInflowCents?: number;
  overdraftRepaymentCents?: number;
  netInflowCents?: number;
};

function getOverdraftMetadata(
  tx: TransactionReceipt,
): InflowOverdraftMetadata | null {
  if (!tx.metadata) return null;
  if (
    tx.type !== "p2p_receive" &&
    tx.type !== "convert_in" &&
    tx.type !== "convert_out"
  )
    return null;
  const m = tx.metadata as InflowOverdraftMetadata;
  return m?.overdraftRepaymentCents != null && m.overdraftRepaymentCents > 0
    ? m
    : null;
}

const OVERDRAFT_DISPLAY_CURRENCY = "ETB";

// --- Type filters ---
type TypeFilter =
  | "all"
  | "sent"
  | "received"
  | "requests"
  | "cards"
  | "conversions";

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "received", label: "Received" },
  { key: "requests", label: "Requests" },
  { key: "cards", label: "Cards" },
  { key: "conversions", label: "Conversions" },
];

const SENT_TYPES: Set<ReceiptType> = new Set([
  "p2p_send",
  "ethswitch_out",
  "batch_send",
]);
const RECEIVED_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
]);
const CARD_TX_TYPES: Set<ReceiptType> = new Set(["card_purchase", "card_atm"]);
const CONVERT_TYPES: Set<ReceiptType> = new Set(["convert_out", "convert_in"]);

// --- Receipt display ---
function getReceiptDisplay(tx: TransactionReceipt): {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
} {
  const name = tx.counterpartyName;
  switch (tx.type) {
    case "p2p_send":
      return {
        label: name ? `Sent to ${name}` : "Sent",
        icon: <ArrowUpRight className="h-5 w-5" />,
        colorClass: "bg-destructive/10 text-destructive",
      };
    case "p2p_receive":
      return {
        label: name ? `From ${name}` : "Received",
        icon: <ArrowDownLeft className="h-5 w-5" />,
        colorClass: "bg-success/10 text-success",
      };
    case "ethswitch_out":
      return {
        label: name ? `Bank transfer to ${name}` : "Bank transfer",
        icon: <Building2 className="h-5 w-5" />,
        colorClass: "bg-muted text-muted-foreground",
      };
    case "ethswitch_in":
      return {
        label: name ? `From ${name}` : "Bank transfer received",
        icon: <Building2 className="h-5 w-5" />,
        colorClass: "bg-success/10 text-success",
      };
    case "card_purchase":
      return {
        label: "Card purchase",
        icon: <CreditCard className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    case "card_atm":
      return {
        label: "ATM withdrawal",
        icon: <Banknote className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    case "loan_disbursement":
      return {
        label: "Loan disbursed",
        icon: <HandCoins className="h-5 w-5" />,
        colorClass: "bg-success/10 text-success",
      };
    case "loan_repayment":
      return {
        label: "Loan repayment",
        icon: <Receipt className="h-5 w-5" />,
        colorClass: "bg-muted text-muted-foreground",
      };
    case "batch_send": {
      const meta = tx.metadata as
        | { recipients?: { name: string }[] }
        | undefined;
      const count = meta?.recipients?.length ?? 0;
      return {
        label:
          count > 0
            ? `Sent to ${count} people`
            : (tx.narration ?? "Batch transfer"),
        icon: <Users className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    }
    case "fee":
      return {
        label: "Service fee",
        icon: <CircleDollarSign className="h-5 w-5" />,
        colorClass: "bg-muted text-muted-foreground",
      };
    case "convert_out": {
      const convertMeta = tx.metadata as
        | { fromCurrency?: string; toCurrency?: string }
        | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Currency conversion");
      return {
        label,
        icon: <ArrowLeftRight className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    }
    case "convert_in": {
      const convertMeta = tx.metadata as
        | { fromCurrency?: string; toCurrency?: string }
        | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Currency conversion");
      return {
        label,
        icon: <ArrowLeftRight className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    }
    case "pot_deposit": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      return {
        label: `Added to ${potMeta?.potName ?? "Pot"}`,
        icon: <PiggyBank className="h-5 w-5" />,
        colorClass: "bg-primary/10 text-primary",
      };
    }
    case "pot_withdraw": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      return {
        label: `Withdrawn from ${potMeta?.potName ?? "Pot"}`,
        icon: <Wallet className="h-5 w-5" />,
        colorClass: "bg-success/10 text-success",
      };
    }
    default:
      return {
        label: tx.narration ?? "Transaction",
        icon: <ArrowUpRight className="h-5 w-5" />,
        colorClass: "bg-muted text-muted-foreground",
      };
  }
}

function formatTxAmount(tx: TransactionReceipt) {
  const isCredit = CREDIT_TYPES.has(tx.type);
  return formatMoney(tx.amountCents, tx.currency, isCredit);
}

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
  });
}

function dateGroupKey(dateStr: string | undefined): string {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-ET", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type GroupedTxs = { label: string; transactions: TransactionReceipt[] }[];

function groupByDate(txs: TransactionReceipt[]): GroupedTxs {
  const map = new Map<string, TransactionReceipt[]>();
  for (const tx of txs) {
    const key = dateGroupKey(tx.createdAt);
    const arr = map.get(key);
    if (arr) arr.push(tx);
    else map.set(key, [tx]);
  }
  return Array.from(map.entries()).map(([label, transactions]) => ({
    label,
    transactions,
  }));
}

// --- Request display helpers ---
type DirectedRequest = PaymentRequest & { direction: "sent" | "received" };

function getRequestIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="h-5 w-5" />;
    case "paid":
      return <CheckCircle2 className="h-5 w-5" />;
    case "declined":
      return <XCircle className="h-5 w-5" />;
    default:
      return <Ban className="h-5 w-5" />;
  }
}

function getRequestColorClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
    case "paid":
      return "bg-success/10 text-success";
    case "declined":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getRequestStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "text-amber-500";
    case "paid":
      return "text-emerald-500";
    case "declined":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

// =============================================
export default function TransactionsPage() {
  const searchParams = useSearchParams();

  // Support legacy ?tab=requests and new ?filter=X
  const initialTypeFilter = (() => {
    const tab = searchParams.get("tab");
    const filter = searchParams.get("filter");
    if (tab === "requests" || filter === "requests")
      return "requests" as TypeFilter;
    if (filter && TYPE_FILTERS.some((f) => f.key === filter))
      return filter as TypeFilter;
    return "all" as TypeFilter;
  })();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>(initialTypeFilter);
  const [requestSubFilter, setRequestSubFilter] = useState<"pending" | "all">(
    "pending",
  );
  const [currencyFilter, setCurrencyFilter] = useState<
    SupportedCurrency | "all"
  >("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Data
  const { data: balances } = useBalances();
  const currency = currencyFilter === "all" ? undefined : currencyFilter;
  const { data: allTxs, isLoading, error } = useTransactions(currency);
  const { data: receivedRequests } = useReceivedRequests();
  const { data: sentRequests } = useSentRequests();

  const currencyOptions = useMemo((): (SupportedCurrency | "all")[] => {
    const codes = new Set((balances ?? []).map((b) => b.currencyCode));
    return ["all", ...CURRENCY_ORDER.filter((c) => codes.has(c))];
  }, [balances]);

  // Merge requests
  const allRequests = useMemo((): DirectedRequest[] => {
    const received = Array.isArray(receivedRequests) ? receivedRequests : [];
    const sent = Array.isArray(sentRequests) ? sentRequests : [];
    return [
      ...received.map((r) => ({ ...r, direction: "received" as const })),
      ...sent.map((r) => ({ ...r, direction: "sent" as const })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [receivedRequests, sentRequests]);

  const pendingRequests = useMemo(
    () => allRequests.filter((r) => r.status === "pending"),
    [allRequests],
  );

  const pendingCount = pendingRequests.length;

  // Filter transactions by type
  const filteredTxs = useMemo(() => {
    const all = Array.isArray(allTxs) ? allTxs : [];
    // Deduplicate convert_in when paired with convert_out
    const convertOutNarrations = new Set(
      all
        .filter((tx) => tx.type === "convert_out" && tx.narration)
        .map((tx) => tx.narration),
    );
    const list = all.filter((tx) => {
      if (
        tx.type === "convert_in" &&
        tx.narration &&
        convertOutNarrations.has(tx.narration)
      )
        return false;
      // Type filter
      if (typeFilter === "sent" && !SENT_TYPES.has(tx.type)) return false;
      if (typeFilter === "received" && !RECEIVED_TYPES.has(tx.type))
        return false;
      if (typeFilter === "cards" && !CARD_TX_TYPES.has(tx.type)) return false;
      if (typeFilter === "conversions" && !CONVERT_TYPES.has(tx.type))
        return false;
      if (typeFilter === "requests") return false; // requests shown separately
      // Search
      if (search) {
        const q = search.toLowerCase();
        return (
          (tx.counterpartyName ?? "").toLowerCase().includes(q) ||
          (tx.narration ?? "").toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q) ||
          tx.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
    return list;
  }, [allTxs, typeFilter, search]);

  // Filter requests by search + sub-filter
  const filteredRequests = useMemo(() => {
    let list = typeFilter === "requests" ? allRequests : pendingRequests;
    if (typeFilter === "requests" && requestSubFilter === "pending") {
      list = list.filter((r) => r.status === "pending");
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.requesterName ?? "").toLowerCase().includes(q) ||
          (r.payerName ?? "").toLowerCase().includes(q) ||
          (r.narration ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [allRequests, pendingRequests, typeFilter, requestSubFilter, search]);

  // Pagination (transactions only)
  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleTxs = filteredTxs.slice(start, start + PAGE_SIZE);
  const groups = useMemo(() => groupByDate(visibleTxs), [visibleTxs]);

  /* eslint-disable react-hooks/set-state-in-effect -- reset pagination and invalid currency filter */
  useEffect(() => {
    setPage(1);
  }, [typeFilter, currencyFilter, search]);
  useEffect(() => {
    if (currencyFilter !== "all" && !currencyOptions.includes(currencyFilter)) {
      setCurrencyFilter("all");
    }
  }, [currencyFilter, currencyOptions]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Show pending requests at top of "all" view
  const showPendingSection =
    typeFilter === "all" && filteredRequests.length > 0;
  // Show request list for "requests" view
  const showRequestList = typeFilter === "requests";
  // Show transaction list for all non-request views
  const showTxList = typeFilter !== "requests";

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Transactions" backHref="/" />

      {/* Search */}
      <div className="relative rounded-2xl border border-border/60 bg-card">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
        <Input
          type="text"
          placeholder="Search by name, note, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 bg-transparent pl-10 pr-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-primary/10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-primary/70" />
          </button>
        )}
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              typeFilter === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground/80"
            }`}
          >
            {f.label}
            {f.key === "requests" && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request sub-filter (when on Requests view) */}
      {showRequestList && (
        <div className="flex gap-2">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRequestSubFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                requestSubFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "pending" ? "Pending" : "All"}
            </button>
          ))}
        </div>
      )}

      {/* Currency filter (not shown for requests-only view) */}
      {showTxList && currencyOptions.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {currencyOptions.map((c) => (
            <button
              key={c}
              onClick={() => setCurrencyFilter(c)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                currencyFilter === c
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground/80"
              }`}
            >
              {c !== "all" && <CurrencyFlag currency={c} size="sm" />}
              {c === "all" ? "All currencies" : c}
            </button>
          ))}
        </div>
      )}

      {/* Pending requests at top of "All" view */}
      {showPendingSection && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <p className="border-b border-border/60 bg-amber-50/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:bg-amber-950/10 dark:text-amber-400">
            Pending requests
          </p>
          <div className="divide-y divide-border/60">
            {filteredRequests.map((req) => (
              <RequestRow key={req.id} req={req} />
            ))}
          </div>
        </div>
      )}

      {/* Request list (when Requests filter active) */}
      {showRequestList && (
        <>
          {filteredRequests.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              <div className="divide-y divide-border/60">
                {filteredRequests.map((req) => (
                  <RequestRow key={req.id} req={req} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={HandCoins}
              title={
                requestSubFilter === "pending"
                  ? "No pending requests"
                  : "No requests yet"
              }
              description="Payment requests you send or receive will appear here."
              actionLabel="Request money"
              actionHref="/requests/new"
            />
          )}
        </>
      )}

      {/* Loading skeleton */}
      {showTxList && isLoading && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          <div className="divide-y divide-border/60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {showTxList && error && (
        <EmptyState
          icon={ReceiptText}
          title="Failed to load transactions"
          description="Try refreshing your activity feed."
        />
      )}

      {/* Empty state */}
      {showTxList && !isLoading && filteredTxs.length === 0 && !error && (
        <EmptyState
          icon={ReceiptText}
          title={search ? "No matching transactions" : "No transactions yet"}
          description={
            search
              ? "Try a different name, note, or type."
              : "Your latest money movement will appear here."
          }
          actionLabel={!search ? "Make a transfer" : undefined}
          actionHref={!search ? "/send" : undefined}
        />
      )}

      {/* Transaction list */}
      {showTxList && groups.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="border-b border-border/60 bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
                <div className="divide-y divide-border/60">
                  {group.transactions.map((tx, i) => {
                    const display = getReceiptDisplay(tx);
                    const isCredit = CREDIT_TYPES.has(tx.type);
                    const odMeta = getOverdraftMetadata(tx);
                    return (
                      <Link
                        key={tx.id ?? `tx-${i}`}
                        href={`/transactions/${tx.id}`}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-primary/5"
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${display.colorClass}`}
                        >
                          {display.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {display.label}
                          </p>
                          {odMeta ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {formatMoney(
                                odMeta.overdraftRepaymentCents ?? 0,
                                OVERDRAFT_DISPLAY_CURRENCY,
                              )}{" "}
                              to overdraft · Net{" "}
                              {formatMoney(
                                odMeta.netInflowCents ?? 0,
                                OVERDRAFT_DISPLAY_CURRENCY,
                              )}{" "}
                              · {formatRelativeTime(tx.createdAt)}
                            </p>
                          ) : tx.type === "batch_send" && tx.metadata ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {(
                                (
                                  tx.metadata as {
                                    recipients?: { name: string }[];
                                  }
                                ).recipients ?? []
                              )
                                .map((r) => r.name)
                                .join(", ") || tx.currency}{" "}
                              · {formatRelativeTime(tx.createdAt)}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              {tx.currency} · {formatRelativeTime(tx.createdAt)}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 font-tabular text-sm font-medium ${isCredit ? "text-success" : "text-foreground"}`}
                        >
                          {formatTxAmount(tx)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredTxs.length > PAGE_SIZE && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="flex items-center gap-1 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Request row component ---
function RequestRow({ req }: { req: DirectedRequest }) {
  const counterparty =
    req.direction === "received"
      ? (req.requesterName ?? "Someone")
      : (req.payerName ?? req.payerPhone ?? "Someone");
  const label =
    req.direction === "received"
      ? `Request from ${counterparty}`
      : `Requested ${counterparty}`;

  return (
    <Link
      href={`/requests/${req.id}`}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-primary/5"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getRequestColorClass(req.status)}`}
      >
        {getRequestIcon(req.status)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {req.narration && `${req.narration} · `}
          {formatRelativeTime(req.createdAt)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span className="block font-tabular text-sm font-medium text-foreground">
          {formatMoney(req.amountCents, req.currencyCode)}
        </span>
        <span
          className={`text-[10px] font-medium ${getRequestStatusColor(req.status)}`}
        >
          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
        </span>
      </div>
    </Link>
  );
}
