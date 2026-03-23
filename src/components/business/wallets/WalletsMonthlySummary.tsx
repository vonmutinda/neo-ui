"use client";

import { useMemo } from "react";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BusinessTransaction } from "@/lib/business-types";

interface WalletsMonthlySummaryProps {
  currencyCode: string;
  transactions: BusinessTransaction[];
}

export function WalletsMonthlySummary({
  currencyCode,
  transactions,
}: WalletsMonthlySummaryProps) {
  const { moneyIn, moneyOut, net } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let inTotal = 0;
    let outTotal = 0;

    for (const tx of transactions) {
      const txDate = new Date(tx.createdAt);
      if (txDate < startOfMonth) continue;
      if (tx.currencyCode !== currencyCode) continue;

      if (tx.direction === "in") {
        inTotal += tx.amountCents;
      } else if (tx.direction === "out") {
        outTotal += tx.amountCents;
      }
    }

    return { moneyIn: inTotal, moneyOut: outTotal, net: inTotal - outTotal };
  }, [transactions, currencyCode]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-background p-6 md:sticky md:top-6",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <h2 className="text-base font-semibold tracking-tight">This Month</h2>
      <p className="mt-1 text-xs text-muted-foreground">{currencyCode}</p>

      <div className="mt-6 space-y-4">
        {/* Opening balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Opening</span>
          <span className="font-mono text-sm font-medium tracking-tight">
            {formatMoney(0, currencyCode, undefined, 0)}
          </span>
        </div>

        {/* Money In */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Money In</span>
          <span className="font-mono text-sm font-medium tracking-tight text-success-foreground">
            +{formatMoney(moneyIn, currencyCode, undefined, 0)}
          </span>
        </div>

        {/* Money Out */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Money Out</span>
          <span className="font-mono text-sm font-medium tracking-tight text-destructive">
            -{formatMoney(moneyOut, currencyCode, undefined, 0)}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/40" />

        {/* Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Balance</span>
          <span
            className={cn(
              "font-mono text-sm font-semibold tracking-tight",
              net >= 0 ? "text-foreground" : "text-destructive",
            )}
          >
            {formatMoney(
              Math.abs(net),
              currencyCode,
              net >= 0 ? undefined : false,
              0,
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
