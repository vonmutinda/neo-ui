"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminTransactions } from "@/hooks/admin/use-admin-transactions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { TransactionFilter } from "@/lib/admin-types";
import type {
  ReceiptType,
  ReceiptStatus,
  SupportedCurrency,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";

const RECEIPT_TYPES: string[] = [
  "p2p_send",
  "p2p_receive",
  "ethswitch_out",
  "ethswitch_in",
  "card_purchase",
  "card_atm",
  "loan_disbursement",
  "loan_repayment",
  "fee",
  "convert_out",
  "convert_in",
  "batch_send",
  "pot_deposit",
  "pot_withdraw",
  "bill_payment",
  "business_transfer_out",
  "business_transfer_in",
];
const RECEIPT_STATUSES: string[] = [
  "pending",
  "completed",
  "failed",
  "reversed",
];
const CURRENCIES: string[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

const TYPE_LABELS: Record<string, string> = {
  p2p_send: "P2P Send",
  p2p_receive: "P2P Receive",
  ethswitch_out: "Bank Transfer Out",
  ethswitch_in: "Bank Transfer In",
  card_purchase: "Card Purchase",
  card_atm: "ATM Withdrawal",
  loan_disbursement: "Loan Disbursement",
  loan_repayment: "Loan Repayment",
  fee: "Fee",
  convert_out: "FX Conversion",
  convert_in: "FX Conversion (In)",
};

function truncateId(id: string | null | undefined) {
  if (!id) return "—";
  return id.length > 12 ? `${id.slice(0, 8)}...` : id;
}

function formatCounterparty(
  name?: string | null,
  phone?: string | null,
): string {
  if (name) return name;
  if (phone) return phone;
  return "—";
}

export default function TransactionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<TransactionFilter>({
    limit: 20,
    offset: 0,
  });
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminTransactions(filter);

  function handleSearch() {
    setFilter((f) => ({ ...f, search: search || undefined, offset: 0 }));
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, user, counterparty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 rounded-[10px] pl-10"
          />
        </div>
        <select
          value={filter.type ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              type: (e.target.value as ReceiptType) || undefined,
              offset: 0,
            }))
          }
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All types</option>
          {RECEIPT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] ?? t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={filter.status ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              status: (e.target.value as ReceiptStatus) || undefined,
              offset: 0,
            }))
          }
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {RECEIPT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={filter.currency ?? ""}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              currency: (e.target.value as SupportedCurrency) || undefined,
              offset: 0,
            }))
          }
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All currencies</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Currency</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Counterparty</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              items.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => router.push(`/admin/transactions/${tx.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {truncateId(tx.id)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.userId ? (
                      <Link
                        href={`/admin/customers/${tx.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-primary hover:underline"
                      >
                        {truncateId(tx.userId)}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-3xl bg-muted px-2.5 py-0.5 text-xs font-semibold">
                      {TYPE_LABELS[tx.type] ??
                        tx.type?.replace(/_/g, " ") ??
                        "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-tabular">
                    {tx.convertedCurrency ? (
                      <span>
                        {formatMoney(tx.amountCents ?? 0, tx.currency)} →{" "}
                        {formatMoney(
                          tx.convertedAmountCents ?? 0,
                          tx.convertedCurrency,
                        )}
                      </span>
                    ) : (
                      formatMoney(tx.amountCents ?? 0, tx.currency)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tx.convertedCurrency
                      ? `${tx.currency} → ${tx.convertedCurrency}`
                      : tx.currency}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatCounterparty(
                      tx.counterpartyName,
                      tx.counterpartyPhone,
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {pagination.offset + 1}–
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)),
                }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  offset: (f.offset ?? 0) + (f.limit ?? 20),
                }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
