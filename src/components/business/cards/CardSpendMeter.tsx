"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getCardSpendPercent } from "@/lib/business-utils";
import type { BusinessCard } from "@/lib/business-types";

interface CardSpendMeterProps {
  card: BusinessCard;
}

const PERIOD_LABELS: Record<string, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
};

export function CardSpendMeter({ card }: CardSpendMeterProps) {
  const percent = getCardSpendPercent(card);
  const remainingCents = Math.max(0, card.spendLimitCents - card.spentCents);
  const periodLabel = PERIOD_LABELS[card.periodType] ?? card.periodType;

  return (
    <div className="flex flex-col gap-1.5">
      {/* Bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 90
              ? "bg-destructive"
              : percent >= 70
                ? "bg-warning"
                : "bg-foreground",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Label */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{percent}%</span> used
        {" · "}
        {formatMoney(remainingCents, "ETB", undefined, 0)} remaining
        {" · "}
        Resets {periodLabel}
      </p>
    </div>
  );
}
