"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminTransaction } from "@/hooks/admin/use-admin-transactions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatMoney } from "@/lib/format";

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

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: tx, isLoading } = useAdminTransaction(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!tx) {
    return <p className="py-12 text-center text-muted-foreground">Transaction not found</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/transactions">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold font-mono">{tx.id}</h2>
          <p className="text-sm text-muted-foreground">
            User:{" "}
            <Link href={`/admin/customers/${tx.userId}`} className="text-primary hover:underline">
              {tx.userId}
            </Link>
          </p>
        </div>
        <StatusBadge status={tx.type} />
        <StatusBadge status={tx.status} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">Transaction Details</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Amount</dt>
            <dd className="font-tabular text-lg font-semibold">
              {formatMoney(tx.amountCents, tx.currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Currency</dt>
            <dd className="font-semibold">{tx.currency}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Type</dt>
            <dd className="font-semibold">{TYPE_LABELS[tx.type] ?? tx.type?.replace(/_/g, " ") ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Status</dt>
            <dd><StatusBadge status={tx.status} /></dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Counterparty</dt>
            <dd className="text-sm">{tx.counterpartyName ?? tx.counterpartyPhone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Narration</dt>
            <dd className="text-sm">{tx.narration ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Created</dt>
            <dd className="text-sm">{new Date(tx.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Updated</dt>
            <dd className="text-sm">{new Date(tx.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
