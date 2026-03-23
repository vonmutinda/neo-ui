"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { BatchPaymentItem } from "@/lib/business-types";

interface BatchMetricsProps {
  items: BatchPaymentItem[];
  currencyCode: string;
}

interface MetricCardProps {
  label: string;
  count: number;
  amount: string;
  accent: string;
}

function MetricCard({ label, count, amount, accent }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-lg font-semibold tracking-tight",
          accent,
        )}
      >
        {amount}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {count} {count === 1 ? "item" : "items"}
      </p>
    </div>
  );
}

export function BatchMetrics({ items, currencyCode }: BatchMetricsProps) {
  const metrics = useMemo(() => {
    const completed = items.filter((i) => i.status === "completed");
    const processing = items.filter((i) => i.status === "processing");
    const failed = items.filter((i) => i.status === "failed");

    const sum = (arr: BatchPaymentItem[]) =>
      arr.reduce((acc, i) => acc + i.amountCents, 0);

    return {
      completedCount: completed.length,
      completedAmount: sum(completed),
      processingCount: processing.length,
      processingAmount: sum(processing),
      failedCount: failed.length,
      failedAmount: sum(failed),
      totalAmount: sum(items),
    };
  }, [items]);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        label="Completed"
        count={metrics.completedCount}
        amount={formatMoney(
          metrics.completedAmount,
          currencyCode,
          undefined,
          0,
        )}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <MetricCard
        label="Processing"
        count={metrics.processingCount}
        amount={formatMoney(
          metrics.processingAmount,
          currencyCode,
          undefined,
          0,
        )}
        accent="text-amber-600 dark:text-amber-400"
      />
      <MetricCard
        label="Failed"
        count={metrics.failedCount}
        amount={formatMoney(metrics.failedAmount, currencyCode, undefined, 0)}
        accent="text-red-600 dark:text-red-400"
      />
      <MetricCard
        label="Fees"
        count={items.length}
        amount={formatMoney(0, currencyCode, undefined, 0)}
        accent="text-muted-foreground"
      />
    </div>
  );
}
