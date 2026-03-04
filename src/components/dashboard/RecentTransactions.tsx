"use client";

import { useTransactions } from "@/hooks/use-wallets";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
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
import Link from "next/link";
import type { TransactionReceipt, ReceiptType } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const CREDIT_TYPES: Set<ReceiptType> = new Set(["p2p_receive", "ethswitch_in", "loan_disbursement", "convert_in", "pot_withdraw"]);

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
        colorClass: "bg-orange-500/10 text-orange-500",
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
        colorClass: "bg-purple-500/10 text-purple-500",
      };
    case "card_atm":
      return {
        label: "ATM withdrawal",
        icon: <Banknote className="h-5 w-5" />,
        colorClass: "bg-amber-500/10 text-amber-500",
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
        colorClass: "bg-amber-500/10 text-amber-500",
      };
    case "batch_send": {
      const meta = tx.metadata as { recipients?: { name: string }[] } | undefined;
      const count = meta?.recipients?.length ?? 0;
      return {
        label: count > 0 ? `Sent to ${count} people` : (tx.narration ?? "Batch transfer"),
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
      const convertMeta = tx.metadata as { fromCurrency?: string; toCurrency?: string } | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Currency conversion");
      return {
        label,
        icon: <ArrowLeftRight className="h-5 w-5" />,
        colorClass: "bg-blue-500/10 text-blue-500",
      };
    }
    case "convert_in": {
      const convertMeta = tx.metadata as { fromCurrency?: string; toCurrency?: string } | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Currency conversion");
      return {
        label,
        icon: <ArrowLeftRight className="h-5 w-5" />,
        colorClass: "bg-blue-500/10 text-blue-500",
      };
    }
    case "pot_deposit": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return {
        label: `Added to ${potName}`,
        icon: <PiggyBank className="h-5 w-5" />,
        colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
      };
    }
    case "pot_withdraw": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return {
        label: `Withdrawn from ${potName}`,
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

function dayLabel(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const txDate = new Date(dateStr);
  const now = new Date();
  const txDay = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - txDay.getTime()) / 86_400_000);
  if (diffDays === 0) return "TODAY";
  if (diffDays === 1) return "YESTERDAY";
  return txDate
    .toLocaleDateString("en-ET", { weekday: "short", day: "numeric", month: "short" })
    .toUpperCase();
}

export function RecentTransactions() {
  const { data: txs, isLoading } = useTransactions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const all = txs ?? [];
  const convertOutNarrations = new Set(
    all.filter((tx) => tx.type === "convert_out" && tx.narration).map((tx) => tx.narration),
  );
  const recent = all
    .filter((tx) => !(tx.type === "convert_in" && tx.narration && convertOutNarrations.has(tx.narration)))
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transactions yet
      </p>
    );
  }

  let lastDay = "";

  return (
    <div className="space-y-1">
      {recent.map((tx, i) => {
        const isCredit = CREDIT_TYPES.has(tx.type);
        const currentDay = dayLabel(tx.createdAt);
        const showDayHeader = currentDay !== lastDay;
        if (showDayHeader) lastDay = currentDay;

        const display = getReceiptDisplay(tx);

        return (
          <div key={tx.id ?? `recent-${i}`}>
            {showDayHeader && currentDay && (
              <p className="px-2 py-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {currentDay}
              </p>
            )}
            <Link
              href="/transactions"
              className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors active:bg-muted"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${display.colorClass}`}>
                {display.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{display.label}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.currency} · {formatRelativeTime(tx.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 font-tabular text-sm font-semibold ${
                  isCredit ? "text-success" : "text-foreground"
                }`}
              >
                {formatMoney(tx.amountCents, tx.currency, isCredit ? true : false)}
              </span>
            </Link>
          </div>
        );
      })}
      <Link
        href="/transactions"
        className="block pt-2 text-center text-sm font-medium text-primary"
      >
        View all transactions
      </Link>
    </div>
  );
}
