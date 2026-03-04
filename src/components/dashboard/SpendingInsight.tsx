"use client";

import type { TransactionReceipt, ReceiptType } from "@/lib/types";
import { formatMoney } from "@/lib/format";

interface SpendingInsightProps {
  transactions: TransactionReceipt[];
}

const CREDIT_TYPES: Set<ReceiptType> = new Set(["p2p_receive", "ethswitch_in", "loan_disbursement", "convert_in"]);

export function SpendingInsight({ transactions }: SpendingInsightProps) {
  const todayStr = new Date().toDateString();
  const todayTxs = transactions.filter(
    (tx) => tx.createdAt && new Date(tx.createdAt).toDateString() === todayStr,
  );

  if (todayTxs.length === 0) {
    return (
      <div className="rounded-2xl bg-muted p-5">
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
    <div className="rounded-2xl bg-muted p-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Spent
          </p>
          <p className="font-tabular text-sm font-semibold text-destructive">
            {formatMoney(spentCents, "ETB", undefined, 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Received
          </p>
          <p className="font-tabular text-sm font-semibold text-success">
            {formatMoney(receivedCents, "ETB", undefined, 0)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Net flow
          </p>
          <p
            className={`font-tabular text-sm font-semibold ${netCents >= 0 ? "text-success" : "text-destructive"}`}
          >
            {formatMoney(netCents, "ETB", netCents >= 0 ? true : false, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
