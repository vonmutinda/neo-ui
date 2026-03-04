"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Search,
  X,
  Clock,
  CreditCard,
  Building2,
  HandCoins,
  Receipt,
  CircleDollarSign,
  Banknote,
  Users,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTransactions } from "@/hooks/use-wallets";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SupportedCurrency, TransactionReceipt, ReceiptType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";

const CURRENCIES: (SupportedCurrency | "all")[] = ["all", "ETB", "USD", "EUR"];
const PAGE_SIZE = 20;

const CREDIT_TYPES: Set<ReceiptType> = new Set(["p2p_receive", "ethswitch_in", "loan_disbursement", "convert_in", "pot_withdraw"]);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "outline",
  failed: "destructive",
  reversed: "secondary",
};

type InflowOverdraftMetadata = {
  totalInflowCents?: number;
  overdraftRepaymentCents?: number;
  netInflowCents?: number;
};

function getOverdraftMetadata(tx: TransactionReceipt): InflowOverdraftMetadata | null {
  if (!tx.metadata) return null;
  // convert_out can carry overdraft metadata when paired convert_in had repayment (wallet API merges it)
  if (tx.type !== "p2p_receive" && tx.type !== "convert_in" && tx.type !== "convert_out") return null;
  const m = tx.metadata as InflowOverdraftMetadata;
  return m?.overdraftRepaymentCents != null && m.overdraftRepaymentCents > 0 ? m : null;
}

// Overdraft repayment only applies to ETB inflows; metadata amounts are always in ETB (use for display).
const OVERDRAFT_DISPLAY_CURRENCY = "ETB";

function getReceiptDisplay(tx: TransactionReceipt): {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
} {
  const name = tx.counterpartyName;
  switch (tx.type) {
    case "p2p_send":
      return { label: name ? `Sent to ${name}` : "Sent", icon: <ArrowUpRight className="h-5 w-5" />, colorClass: "bg-destructive/10 text-destructive" };
    case "p2p_receive":
      return { label: name ? `From ${name}` : "Received", icon: <ArrowDownLeft className="h-5 w-5" />, colorClass: "bg-success/10 text-success" };
    case "ethswitch_out":
      return { label: name ? `Bank transfer to ${name}` : "Bank transfer", icon: <Building2 className="h-5 w-5" />, colorClass: "bg-orange-500/10 text-orange-500" };
    case "ethswitch_in":
      return { label: name ? `From ${name}` : "Bank transfer received", icon: <Building2 className="h-5 w-5" />, colorClass: "bg-success/10 text-success" };
    case "card_purchase":
      return { label: "Card purchase", icon: <CreditCard className="h-5 w-5" />, colorClass: "bg-purple-500/10 text-purple-500" };
    case "card_atm":
      return { label: "ATM withdrawal", icon: <Banknote className="h-5 w-5" />, colorClass: "bg-amber-500/10 text-amber-500" };
    case "loan_disbursement":
      return { label: "Loan disbursed", icon: <HandCoins className="h-5 w-5" />, colorClass: "bg-success/10 text-success" };
    case "loan_repayment":
      return { label: "Loan repayment", icon: <Receipt className="h-5 w-5" />, colorClass: "bg-amber-500/10 text-amber-500" };
    case "batch_send": {
      const meta = tx.metadata as { recipients?: { name: string }[] } | undefined;
      const count = meta?.recipients?.length ?? 0;
      return { label: count > 0 ? `Sent to ${count} people` : (tx.narration ?? "Batch transfer"), icon: <Users className="h-5 w-5" />, colorClass: "bg-primary/10 text-primary" };
    }
    case "fee":
      return { label: "Service fee", icon: <CircleDollarSign className="h-5 w-5" />, colorClass: "bg-muted text-muted-foreground" };
    case "convert_out": {
      const convertMeta = tx.metadata as { fromCurrency?: string; toCurrency?: string } | undefined;
      const label = convertMeta?.fromCurrency && convertMeta?.toCurrency
        ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
        : (tx.narration ?? "Currency conversion");
      return { label, icon: <ArrowLeftRight className="h-5 w-5" />, colorClass: "bg-blue-500/10 text-blue-500" };
    }
    case "convert_in": {
      const convertMeta = tx.metadata as { fromCurrency?: string; toCurrency?: string } | undefined;
      const label = convertMeta?.fromCurrency && convertMeta?.toCurrency
        ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
        : (tx.narration ?? "Currency conversion");
      return { label, icon: <ArrowLeftRight className="h-5 w-5" />, colorClass: "bg-blue-500/10 text-blue-500" };
    }
    case "pot_deposit": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return { label: `Added to ${potName}`, icon: <PiggyBank className="h-5 w-5" />, colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400" };
    }
    case "pot_withdraw": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return { label: `Withdrawn from ${potName}`, icon: <Wallet className="h-5 w-5" />, colorClass: "bg-success/10 text-success" };
    }
    default:
      return { label: tx.narration ?? "Transaction", icon: <ArrowUpRight className="h-5 w-5" />, colorClass: "bg-muted text-muted-foreground" };
  }
}

function formatTxAmount(tx: TransactionReceipt) {
  const isCredit = CREDIT_TYPES.has(tx.type);
  return formatMoney(tx.amountCents, tx.currency, isCredit ? true : false);
}

function formatDetailDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-ET", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
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
  return new Date(dateStr).toLocaleDateString("en-ET", { month: "short", day: "numeric" });
}

function dateGroupKey(dateStr: string | undefined): string {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-ET", { month: "long", day: "numeric", year: "numeric" });
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
  return Array.from(map.entries()).map(([label, transactions]) => ({ label, transactions }));
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<SupportedCurrency | "all">("all");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedTx, setSelectedTx] = useState<TransactionReceipt | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const currency = filter === "all" ? undefined : filter;
  const { data: allTxs, isLoading, error } = useTransactions(currency);

  const filtered = useMemo(() => {
    const all = allTxs ?? [];
    const convertOutNarrations = new Set(
      all.filter((tx) => tx.type === "convert_out" && tx.narration).map((tx) => tx.narration),
    );
    return all.filter((tx) => {
      if (tx.type === "convert_in" && tx.narration && convertOutNarrations.has(tx.narration)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (tx.counterpartyName ?? "").toLowerCase().includes(q) ||
        (tx.narration ?? "").toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
      );
    });
  }, [allTxs, search]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const groups = useMemo(() => groupByDate(visible), [visible]);

  const loadMore = useCallback(() => {
    if (hasMore) setVisibleCount((prev) => prev + PAGE_SIZE);
  }, [hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [filter, search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Transactions</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, note, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 rounded-[10px] bg-background pl-10 pr-10 text-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Currency filter */}
      <div className="flex gap-2 overflow-x-auto">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c !== "all" && <CurrencyFlag currency={c} size="sm" />}
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load transactions</p>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {search ? "No transactions match your search" : "No transactions yet"}
          </p>
        </div>
      )}

      {/* Transaction list */}
      {groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="space-y-0.5">
                <AnimatePresence initial={false}>
                  {group.transactions.map((tx, i) => {
                    const display = getReceiptDisplay(tx);
                    const isCredit = CREDIT_TYPES.has(tx.type);
                    const odMeta = getOverdraftMetadata(tx);
                    return (
                      <motion.button
                        key={tx.id ?? `tx-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.3) }}
                        onClick={() => setSelectedTx(tx)}
                        className="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition-colors active:bg-muted"
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${display.colorClass}`}>
                          {display.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{display.label}</p>
                          {odMeta ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {formatMoney(odMeta.overdraftRepaymentCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} to overdraft · Net{" "}
                              {formatMoney(odMeta.netInflowCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} · {formatRelativeTime(tx.createdAt)}
                            </p>
                          ) : tx.type === "batch_send" && tx.metadata ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {((tx.metadata as { recipients?: { name: string }[] }).recipients ?? [])
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
                        <div className="shrink-0 text-right">
                          <span className={`block font-tabular text-sm font-semibold ${isCredit ? "text-success" : "text-foreground"}`}>
                            {formatTxAmount(tx)}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          <div ref={sentinelRef} className="h-1" />

          {!hasMore && filtered.length > PAGE_SIZE && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              All {filtered.length} transactions loaded
            </p>
          )}
        </div>
      )}

      {/* Receipt detail sheet */}
      <Sheet open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl border-x border-t border-border">
          {selectedTx && <ReceiptDetail tx={selectedTx} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ReceiptDetail({ tx }: { tx: TransactionReceipt }) {
  const display = getReceiptDisplay(tx);
  const isCredit = CREDIT_TYPES.has(tx.type);

  const batchRecipients =
    tx.type === "batch_send" && tx.metadata
      ? ((tx.metadata as { recipients?: { name: string; phone: string; amountCents: number }[] }).recipients ?? [])
      : [];

  const overdraftMeta = getOverdraftMetadata(tx);

  return (
    <>
      <SheetHeader>
        <SheetTitle>Transaction Details</SheetTitle>
      </SheetHeader>
      <div className="space-y-5 p-5">
        <div className="text-center">
          <p className={`font-tabular text-3xl font-bold ${isCredit ? "text-success" : "text-foreground"}`}>
            {formatMoney(tx.amountCents, tx.currency, isCredit ? true : false)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{display.label}</p>
          {overdraftMeta && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatMoney(overdraftMeta.overdraftRepaymentCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} applied to overdraft · Net{" "}
              {formatMoney(overdraftMeta.netInflowCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} to wallet
            </p>
          )}
        </div>

        {overdraftMeta && (
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Inflow breakdown
            </h3>
            <div className="space-y-0 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border">
              <DetailRow label="Total incoming" value={formatMoney(overdraftMeta.totalInflowCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} />
              <DetailRow label="Applied to overdraft" value={formatMoney(overdraftMeta.overdraftRepaymentCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} />
              <DetailRow label="Net to wallet" value={formatMoney(overdraftMeta.netInflowCents ?? 0, OVERDRAFT_DISPLAY_CURRENCY)} />
            </div>
          </div>
        )}

        <div className="space-y-0 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border">
          <DetailRow label="Type" value={tx.type.replaceAll("_", " ")} />
          <DetailRow label="Status">
            <Badge variant={STATUS_VARIANT[tx.status] ?? "outline"} className="capitalize">
              {tx.status}
            </Badge>
          </DetailRow>
          <DetailRow label="Currency" value={tx.currency} />
          {(tx.type === "pot_deposit" || tx.type === "pot_withdraw") && (tx.metadata as { potName?: string })?.potName && (
            <DetailRow label="Pot" value={(tx.metadata as { potName: string }).potName} />
          )}
          {tx.counterpartyName && <DetailRow label="Counterparty" value={tx.counterpartyName} />}
          {tx.counterpartyPhone && <DetailRow label="Phone" value={tx.counterpartyPhone} />}
          {tx.narration && <DetailRow label="Note" value={tx.narration} />}
          {tx.feeCents > 0 && (
            <DetailRow label="Fee" value={formatMoney(tx.feeCents, tx.currency)} />
          )}
          <DetailRow label="Date" value={formatDetailDate(tx.createdAt)} icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />} />
          <DetailRow label="Transaction ID" value={tx.id} mono />
        </div>

        {batchRecipients.length > 0 && (
          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Recipients ({batchRecipients.length})
            </h3>
            <div className="space-y-0 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border">
              {batchRecipients.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${i < batchRecipients.length - 1 ? "border-b border-border" : ""}`}
                >
                  <UserAvatar name={r.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.phone}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold font-tabular">
                    {formatMoney(r.amountCents, tx.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  mono,
  icon,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-border/50 px-4 py-3 last:border-0">
      <span className="shrink-0 text-sm capitalize text-muted-foreground">{label}</span>
      {children ?? (
        <span className={`ml-4 flex items-center gap-1.5 text-right text-sm font-medium ${mono ? "font-mono text-xs break-all" : ""}`}>
          {icon}
          {value}
        </span>
      )}
    </div>
  );
}
