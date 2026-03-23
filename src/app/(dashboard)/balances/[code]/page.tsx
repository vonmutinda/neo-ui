"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Building2,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBalances } from "@/hooks/use-balances";
import { useTransactions } from "@/hooks/use-wallets";
import { useSendStore } from "@/lib/send-store";

import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type {
  SupportedCurrency,
  TransactionReceipt,
  ReceiptType,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";

const CREDIT_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
  "loan_disbursement",
  "convert_in",
]);

const CURRENCY_NAMES: Record<string, string> = {
  ETB: "Ethiopian Birr",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  KES: "Kenyan Shilling",
};

function ActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  variant = "primary",
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) {
  const circleClass =
    variant === "primary"
      ? "flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
      : "flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card text-primary transition-transform active:scale-95";

  const content = (
    <div className="flex flex-col items-center gap-1">
      <div className={circleClass}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return <button onClick={onClick}>{content}</button>;
}

function AccountDetailRow({
  label,
  value,
  fieldId,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  fieldId: string;
  copiedField: string | null;
  onCopy: (value: string, id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <button
        onClick={() => onCopy(value, fieldId)}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <span className="font-mono">{value}</span>
        {copiedField === fieldId ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
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

function TransactionRow({
  tx,
  index,
}: {
  tx: TransactionReceipt;
  index: number;
}) {
  const isConversion = tx.type === "convert_out" || tx.type === "convert_in";
  const isCredit = CREDIT_TYPES.has(tx.type);
  const label = isConversion
    ? (tx.narration ?? "Currency conversion")
    : (tx.counterpartyName ?? tx.narration ?? tx.type.replaceAll("_", " "));

  const iconColor = isConversion
    ? "bg-blue-500/10 text-blue-500"
    : isCredit
      ? "bg-success/10 text-success"
      : "bg-destructive/10 text-destructive";

  const rowContent = (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColor}`}
      >
        {isConversion ? (
          <ArrowLeftRight className="h-5 w-5" />
        ) : isCredit ? (
          <ArrowDownLeft className="h-5 w-5" />
        ) : (
          <ArrowUpRight className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium capitalize">{label}</p>
        <p className="text-xs text-muted-foreground">
          {tx.currency} · {formatRelativeTime(tx.createdAt)}
        </p>
      </div>
      <span
        className={`whitespace-nowrap font-tabular text-sm font-semibold ${
          isConversion
            ? "text-blue-500"
            : isCredit
              ? "text-success"
              : "text-foreground"
        }`}
      >
        {formatMoney(tx.amountCents, tx.currency, isCredit ? true : false)}
      </span>
    </>
  );

  const rowClassName =
    "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors active:bg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      {tx.id ? (
        <Link href={`/transactions/${tx.id}`} className={rowClassName}>
          {rowContent}
        </Link>
      ) : (
        <div className={rowClassName}>{rowContent}</div>
      )}
    </motion.div>
  );
}

export default function BalanceDetailPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code?.toUpperCase() ?? "ETB") as SupportedCurrency;

  const setCurrency = useSendStore((s) => s.setCurrency);

  const { data: balances, isLoading: balancesLoading } = useBalances();
  const { data: transactions, isLoading: txLoading } = useTransactions(code);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  const balance = balances?.find((b) => b.currencyCode === code);
  const ad = balance?.accountDetails;

  const filteredTxs = (Array.isArray(transactions) ? transactions : []).filter(
    (tx) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        (tx.counterpartyName ?? "").toLowerCase().includes(q) ||
        (tx.narration ?? "").toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    },
  );

  async function copyToClipboard(value: string, field: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function handleSend() {
    setCurrency(code);
  }

  if (balancesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col items-center gap-3 py-6">
          <Skeleton className="h-14 w-14 rounded-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-56" />
        </div>
        <div className="flex justify-center gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <EmptyState
        icon={Building2}
        title={`No active ${code} balance`}
        description="Add this currency to start sending, receiving, and tracking activity."
        actionLabel="Go to dashboard"
        actionHref="/"
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title={`${CURRENCY_NAMES[code] ?? code} Account`}
        backHref="/balances"
        rightSlot={
          <button
            onClick={() => setShowAccountDetails(!showAccountDetails)}
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:bg-muted"
          >
            Account details
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showAccountDetails ? "rotate-180" : ""}`}
            />
          </button>
        }
      />

      {/* Currency Identity */}
      <div className="flex flex-col items-center gap-2.5">
        <CurrencyFlag currency={code} size="xl" />
        <p className="text-base font-medium text-muted-foreground">
          {code} balance
        </p>

        {ad && (
          <button
            onClick={() => copyToClipboard(ad.iban, "iban-badge")}
            className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium transition-colors active:bg-muted/80"
          >
            <Building2 className="h-3.5 w-3.5" />
            {ad.iban.replace(/(.{4})/g, "$1 ").trim()}
          </button>
        )}

        <span className="font-tabular text-3xl font-bold tracking-tight md:text-4xl">
          {formatMoney(balance.balanceCents, balance.currencyCode)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <ActionButton
          icon={Plus}
          label="Add"
          href={`/receive?currency=${code}`}
          variant="secondary"
        />
        <ActionButton
          icon={ArrowUp}
          label="Send"
          href="/send"
          onClick={handleSend}
        />
        <ActionButton
          icon={ArrowDown}
          label="Receive"
          href={`/receive?currency=${code}`}
        />
        <ActionButton
          icon={ArrowLeftRight}
          label="Convert"
          href={`/convert?from=${code}`}
          variant="secondary"
        />
        <ActionButton
          icon={MoreHorizontal}
          label="More"
          variant="secondary"
          onClick={() => setShowAccountDetails(!showAccountDetails)}
        />
      </div>

      {/* Account Details Sheet */}
      <AnimatePresence>
        {showAccountDetails && ad && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <h3 className="mb-3 text-base font-semibold text-muted-foreground">
                Account details
              </h3>
              <div className="divide-y">
                <AccountDetailRow
                  label="IBAN"
                  value={ad.iban}
                  fieldId="iban"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <AccountDetailRow
                  label="Account number"
                  value={ad.accountNumber}
                  fieldId="account"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <AccountDetailRow
                  label="SWIFT / BIC"
                  value={ad.swiftCode}
                  fieldId="swift"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                <AccountDetailRow
                  label="Bank name"
                  value={ad.bankName}
                  fieldId="bank"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                {ad.routingNumber && (
                  <AccountDetailRow
                    label="Routing number"
                    value={ad.routingNumber}
                    fieldId="routing"
                    copiedField={copiedField}
                    onCopy={copyToClipboard}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Transactions
          </h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : filteredTxs.length > 0 ? (
          <div className="space-y-0.5 overflow-hidden rounded-2xl border border-border/60 bg-card">
            {filteredTxs.map((tx, i) => (
              <TransactionRow
                key={tx.id ? `${tx.id}-${i}` : `tx-${i}`}
                tx={tx}
                index={i}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={searchQuery ? Search : ArrowLeftRight}
            title={
              searchQuery ? "No matching transactions" : "No transactions yet"
            }
            description={
              searchQuery
                ? "Try a different name, note, or transaction type."
                : `Your ${code} activity will appear here once you start moving money.`
            }
            actionLabel={!searchQuery ? `Receive ${code}` : undefined}
            actionHref={!searchQuery ? `/receive?currency=${code}` : undefined}
          />
        )}
      </div>
    </div>
  );
}
