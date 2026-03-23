"use client";

import { useTransactions } from "@/hooks/use-wallets";
import { EmptyState } from "@/components/shared/EmptyState";
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
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import type { TransactionReceipt, ReceiptType } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const CREDIT_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
  "loan_disbursement",
  "convert_in",
  "pot_withdraw",
  "business_transfer_in",
]);

function getReceiptDisplay(tx: TransactionReceipt): {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
} {
  const name = tx.counterpartyName;
  const iconClass = "h-5 w-5";

  switch (tx.type) {
    case "p2p_send":
      return {
        label: name ? `Sent to ${name}` : "Sent",
        icon: <ArrowUpRight className={iconClass} />,
        colorClass: "bg-destructive/10 text-destructive",
      };
    case "p2p_receive":
      return {
        label: name ? `From ${name}` : "Received",
        icon: <ArrowDownLeft className={iconClass} />,
        colorClass: "bg-success/10 text-success",
      };
    case "ethswitch_out":
      return {
        label: name ? `To ${name}` : "Bank transfer",
        icon: <Building2 className={iconClass} />,
        colorClass: "bg-warning/10 text-warning",
      };
    case "ethswitch_in":
      return {
        label: name ? `From ${name}` : "Bank transfer in",
        icon: <Building2 className={iconClass} />,
        colorClass: "bg-success/10 text-success",
      };
    case "card_purchase":
      return {
        label: "Card purchase",
        icon: <CreditCard className={iconClass} />,
        colorClass: "bg-primary/10 text-primary",
      };
    case "card_atm":
      return {
        label: "ATM withdrawal",
        icon: <Banknote className={iconClass} />,
        colorClass: "bg-warning/10 text-warning",
      };
    case "loan_disbursement":
      return {
        label: "Loan disbursed",
        icon: <HandCoins className={iconClass} />,
        colorClass: "bg-success/10 text-success",
      };
    case "loan_repayment":
      return {
        label: "Loan repayment",
        icon: <Receipt className={iconClass} />,
        colorClass: "bg-warning/10 text-warning",
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
        icon: <Users className={iconClass} />,
        colorClass: "bg-primary/10 text-primary",
      };
    }
    case "fee":
      return {
        label: "Service fee",
        icon: <CircleDollarSign className={iconClass} />,
        colorClass: "bg-muted text-muted-foreground",
      };
    case "convert_out": {
      const convertMeta = tx.metadata as
        | { fromCurrency?: string; toCurrency?: string }
        | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Conversion");
      return {
        label,
        icon: <ArrowLeftRight className={iconClass} />,
        colorClass: "bg-accent/10 text-accent-foreground",
      };
    }
    case "convert_in": {
      const convertMeta = tx.metadata as
        | { fromCurrency?: string; toCurrency?: string }
        | undefined;
      const label =
        convertMeta?.fromCurrency && convertMeta?.toCurrency
          ? `${convertMeta.fromCurrency} → ${convertMeta.toCurrency}`
          : (tx.narration ?? "Conversion");
      return {
        label,
        icon: <ArrowLeftRight className={iconClass} />,
        colorClass: "bg-accent/10 text-accent-foreground",
      };
    }
    case "pot_deposit": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return {
        label: `Added to ${potName}`,
        icon: <PiggyBank className={iconClass} />,
        colorClass: "bg-accent/10 text-accent-foreground",
      };
    }
    case "pot_withdraw": {
      const potMeta = tx.metadata as { potName?: string } | undefined;
      const potName = potMeta?.potName ?? "Pot";
      return {
        label: `From ${potName}`,
        icon: <Wallet className={iconClass} />,
        colorClass: "bg-success/10 text-success",
      };
    }
    case "bill_payment":
      return {
        label: tx.narration ?? "Bill payment",
        icon: <ReceiptText className={iconClass} />,
        colorClass: "bg-warning/10 text-warning",
      };
    case "business_transfer_out":
      return {
        label: name ? `To ${name}` : "Business transfer",
        icon: <Building2 className={iconClass} />,
        colorClass: "bg-destructive/10 text-destructive",
      };
    case "business_transfer_in":
      return {
        label: name ? `From ${name}` : "Business transfer in",
        icon: <Building2 className={iconClass} />,
        colorClass: "bg-success/10 text-success",
      };
    default:
      return {
        label: tx.narration ?? "Transaction",
        icon: <ArrowUpRight className={iconClass} />,
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
  return new Date(dateStr).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
  });
}

export function RecentTransactions() {
  const { data: txs, isLoading } = useTransactions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const all = Array.isArray(txs) ? txs : [];
  const convertOutNarrations = new Set(
    all
      .filter((tx) => tx.type === "convert_out" && tx.narration)
      .map((tx) => tx.narration),
  );
  const recent = all
    .filter(
      (tx) =>
        !(
          tx.type === "convert_in" &&
          tx.narration &&
          convertOutNarrations.has(tx.narration)
        ),
    )
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="No transactions yet"
        description="Your latest money movement will appear here once you start using Neo."
        actionLabel="Make a transfer"
        actionHref="/send"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card">
      {recent.map((tx, i) => {
        const isCredit = CREDIT_TYPES.has(tx.type);
        const display = getReceiptDisplay(tx);
        const isLast = i === recent.length - 1;

        return (
          <Link
            key={tx.id ?? `recent-${i}`}
            href={`/transactions/${tx.id}`}
            className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors active:bg-muted ${
              !isLast ? "border-b border-border/60" : ""
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${display.colorClass}`}
            >
              {display.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {display.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(tx.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 font-tabular text-sm font-semibold ${
                isCredit ? "text-success" : "text-foreground"
              }`}
            >
              {formatMoney(
                tx.amountCents,
                tx.currency,
                isCredit ? true : false,
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
