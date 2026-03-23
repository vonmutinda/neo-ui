"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { TransactionCategory } from "@/lib/business-types";

interface CategorySummaryChartProps {
  categories: TransactionCategory[];
  currencyCode: string;
}

export function CategorySummaryChart({
  categories,
  currencyCode,
}: CategorySummaryChartProps) {
  const withTotals = categories.filter(
    (c) => c.totalCents != null && c.totalCents > 0,
  );

  const grandTotal = withTotals.reduce(
    (acc, c) => acc + (c.totalCents ?? 0),
    0,
  );

  if (withTotals.length === 0 || grandTotal === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <p className="text-sm text-muted-foreground">
          No category spend data yet
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        Spend by Category
      </p>

      {/* Bar chart */}
      <div className="mt-3 flex h-3 overflow-hidden rounded-full">
        {withTotals.map((c) => {
          const pct = ((c.totalCents ?? 0) / grandTotal) * 100;
          return (
            <div
              key={c.id}
              className="h-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: c.color,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {withTotals.map((c) => {
          const pct = Math.round(((c.totalCents ?? 0) / grandTotal) * 100);
          return (
            <div key={c.id} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="flex-1 truncate text-xs text-foreground">
                {c.name}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatMoney(c.totalCents ?? 0, currencyCode, undefined, 0)}
              </span>
              <span className="w-8 text-right text-[11px] tabular-nums text-muted-foreground">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
