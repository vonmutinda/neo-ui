"use client";

import { use } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
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
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTransactions } from "@/hooks/use-wallets";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TransactionReceipt, ReceiptType } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone-utils";

const CREDIT_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
  "loan_disbursement",
  "convert_in",
  "pot_withdraw",
]);

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
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
    case "convert_out":
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

function formatDetailDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyableId({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-4 flex items-center gap-1.5 text-right text-xs font-mono break-all text-muted-foreground hover:text-primary transition-colors"
      aria-label="Copy reference"
    >
      <span>
        {value.slice(0, 8)}...{value.slice(-4)}
      </span>
      {copied ? (
        <Check className="h-3 w-3 text-primary shrink-0" />
      ) : (
        <Copy className="h-3 w-3 shrink-0 text-primary/70" />
      )}
    </button>
  );
}

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: allTxs, isLoading } = useTransactions();

  const tx = Array.isArray(allTxs)
    ? allTxs.find((t) => t.id === id)
    : undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="space-y-6">
        <PageHeader title="Transaction" backHref="/transactions" />
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card py-12 text-center">
          <p className="text-sm text-muted-foreground">Transaction not found</p>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Go to transactions
          </Link>
        </div>
      </div>
    );
  }

  const display = getReceiptDisplay(tx);
  const isCredit = CREDIT_TYPES.has(tx.type);
  const overdraftMeta = getOverdraftMetadata(tx);
  const batchRecipients =
    tx.type === "batch_send" && tx.metadata
      ? ((
          tx.metadata as {
            recipients?: { name: string; phone: string; amountCents: number }[];
          }
        ).recipients ?? [])
      : [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Transaction" backHref="/transactions" />

      {/* Summary card */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-6">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${display.colorClass}`}
        >
          {display.icon}
        </div>
        <p
          className={`font-tabular text-3xl font-bold ${isCredit ? "text-success" : "text-foreground"}`}
        >
          {formatMoney(tx.amountCents, tx.currency, isCredit)}
        </p>
        <p className="text-sm font-medium text-foreground/90">
          {display.label}
        </p>
        {overdraftMeta && (
          <p className="text-center text-xs text-muted-foreground">
            {formatMoney(
              overdraftMeta.overdraftRepaymentCents ?? 0,
              OVERDRAFT_DISPLAY_CURRENCY,
            )}{" "}
            applied to overdraft · Net{" "}
            {formatMoney(
              overdraftMeta.netInflowCents ?? 0,
              OVERDRAFT_DISPLAY_CURRENCY,
            )}{" "}
            to wallet
          </p>
        )}
      </div>

      {overdraftMeta && (
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Inflow breakdown
          </h3>
          <div className="space-y-0 overflow-hidden rounded-2xl border border-border/60 bg-card">
            <DetailRow
              label="Total incoming"
              value={formatMoney(
                overdraftMeta.totalInflowCents ?? 0,
                OVERDRAFT_DISPLAY_CURRENCY,
              )}
            />
            <DetailRow
              label="Applied to overdraft"
              value={formatMoney(
                overdraftMeta.overdraftRepaymentCents ?? 0,
                OVERDRAFT_DISPLAY_CURRENCY,
              )}
            />
            <DetailRow
              label="Net to wallet"
              value={formatMoney(
                overdraftMeta.netInflowCents ?? 0,
                OVERDRAFT_DISPLAY_CURRENCY,
              )}
            />
          </div>
        </div>
      )}

      <div className="space-y-0 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <DetailRow label="Status">
          <Badge
            variant={STATUS_VARIANT[tx.status] ?? "outline"}
            className="capitalize"
          >
            {tx.status}
          </Badge>
        </DetailRow>
        {(tx.type === "pot_deposit" || tx.type === "pot_withdraw") &&
          (tx.metadata as { potName?: string })?.potName && (
            <DetailRow
              label="Pot"
              value={(tx.metadata as { potName: string }).potName}
            />
          )}
        {(() => {
          const isSend = tx.type === "p2p_send" || tx.type === "ethswitch_out";
          const isReceive =
            tx.type === "p2p_receive" || tx.type === "ethswitch_in";
          const recipientLabel = isSend
            ? "Recipient"
            : isReceive
              ? "From"
              : "Counterparty";
          const recipientValue =
            tx.counterpartyName ??
            (tx.counterpartyPhone
              ? formatPhoneDisplay(tx.counterpartyPhone)
              : null);
          return recipientValue ? (
            <DetailRow label={recipientLabel} value={recipientValue} />
          ) : null;
        })()}
        {tx.counterpartyName && tx.counterpartyPhone && (
          <DetailRow
            label="Phone"
            value={formatPhoneDisplay(tx.counterpartyPhone)}
          />
        )}
        {tx.narration && <DetailRow label="Note" value={tx.narration} />}
        {tx.feeCents > 0 && (
          <DetailRow
            label="Fee"
            value={formatMoney(tx.feeCents, tx.currency)}
          />
        )}
        <DetailRow
          label="Date"
          value={formatDetailDate(tx.createdAt)}
          icon={<Clock className="h-3.5 w-3.5 text-primary/70" />}
        />
        <DetailRow label="Reference">
          <CopyableId value={tx.id} />
        </DetailRow>
      </div>

      {batchRecipients.length > 0 && (
        <div>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recipients ({batchRecipients.length})
          </h3>
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {batchRecipients.map((r, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < batchRecipients.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <UserAvatar name={r.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.phone}
                  </p>
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
    <div className="flex items-start justify-between border-b border-border/60 px-4 py-3 last:border-b-0">
      <span className="shrink-0 text-sm capitalize text-muted-foreground">
        {label}
      </span>
      {children ?? (
        <span
          className={`ml-4 flex items-center gap-1.5 text-right text-sm font-medium tabular-nums ${mono ? "font-mono text-xs break-all" : ""}`}
        >
          {icon}
          {value}
        </span>
      )}
    </div>
  );
}
