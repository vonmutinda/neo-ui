"use client";

import { cn } from "@/lib/utils";
import type { TransactionCategory } from "@/lib/business-types";

interface CategorySummaryChartProps {
  categories: TransactionCategory[];
  currencyCode: string;
}

export function CategorySummaryChart({
  categories,
}: CategorySummaryChartProps) {
  if (categories.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <p className="text-sm text-muted-foreground">No categories yet</p>
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
        Categories
      </p>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: c.color ?? "#888" }}
            />
            <span className="flex-1 truncate text-xs text-foreground">
              {c.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
