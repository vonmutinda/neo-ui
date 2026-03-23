"use client";

import type { TransactionReceipt, ReceiptType } from "@/lib/types";
import { formatMoney } from "@/lib/format";

interface SpendingInsightProps {
  transactions: TransactionReceipt[];
}

const CREDIT_TYPES: Set<ReceiptType> = new Set([
  "p2p_receive",
  "ethswitch_in",
  "loan_disbursement",
  "convert_in",
]);

export function SpendingInsight({ transactions }: SpendingInsightProps) {
  const todayStr = new Date().toDateString();
  const todayTxs = transactions.filter(
    (tx) => tx.createdAt && new Date(tx.createdAt).toDateString() === todayStr,
  );

  if (todayTxs.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-[0_1px_3px_oklch(0.40_0.06_70/4%)]">
        <p className="text-center text-sm text-muted-foreground">
          No activity today
        </p>
      </div>
    );
  }

  const spentCents = todayTxs
    .filter((tx) => !CREDIT_TYPES.has(tx.type))
    .reduce((sum, tx) => sum + tx.amountCents, 0);

  const receivedCents = todayTxs
    .filter((tx) => CREDIT_TYPES.has(tx.type))
    .reduce((sum, tx) => sum + tx.amountCents, 0);

  const netCents = receivedCents - spentCents;

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-[0_1px_3px_oklch(0.40_0.06_70/4%)]">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Spent
          </p>
          <p className="font-tabular text-sm font-semibold text-destructive">
            {formatMoney(spentCents, "ETB", undefined, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Received
          </p>
          <p className="font-tabular text-sm font-semibold text-primary">
            {formatMoney(receivedCents, "ETB", undefined, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Net flow
          </p>
          <p
            className={`font-tabular text-sm font-semibold ${netCents >= 0 ? "text-primary" : "text-destructive"}`}
          >
            {formatMoney(netCents, "ETB", netCents >= 0 ? true : false, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
