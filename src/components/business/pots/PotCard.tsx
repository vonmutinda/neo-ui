"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getTaxTypeLabel } from "@/lib/business-utils";
import { ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import type { BusinessPot, PotCategory } from "@/lib/business-types";

const CATEGORY_STYLE: Record<
  PotCategory,
  { label: string; bg: string; text: string }
> = {
  general: { label: "General", bg: "bg-muted", text: "text-muted-foreground" },
  tax: {
    label: "Tax",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  petty_cash: {
    label: "Petty Cash",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  savings: {
    label: "Savings",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  event: {
    label: "Event",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
  },
  reserve: {
    label: "Reserve",
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-400",
  },
};

interface PotCardProps {
  pot: BusinessPot;
  canManage: boolean;
  onAddFunds?: (pot: BusinessPot) => void;
  onWithdraw?: (pot: BusinessPot) => void;
}

export function PotCard({
  pot,
  canManage,
  onAddFunds,
  onWithdraw,
}: PotCardProps) {
  const style = CATEGORY_STYLE[pot.category] ?? CATEGORY_STYLE.general;
  const targetCents = pot.targetCents ?? 0;
  const progressPct =
    targetCents > 0
      ? Math.min(100, Math.round((pot.balanceCents / targetCents) * 100))
      : 0;

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        "transition-all hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
      )}
    >
      {/* Header row: emoji + name + category badge */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/business/pots/${pot.id}`}
          className="flex items-center gap-2 min-w-0 group"
        >
          {pot.emoji && <span className="text-lg shrink-0">{pot.emoji}</span>}
          <p className="text-sm font-semibold text-foreground truncate group-hover:underline">
            {pot.name}
          </p>
        </Link>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            style.bg,
            style.text,
          )}
        >
          {style.label}
        </span>
      </div>

      {/* Tax type sub-badge */}
      {pot.category === "tax" && pot.taxDetails?.taxType && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {getTaxTypeLabel(pot.taxDetails.taxType)}
          {pot.taxDetails.dueDate && (
            <>
              {" · Due "}
              {new Date(pot.taxDetails.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </>
          )}
        </p>
      )}

      {/* Balance */}
      <div className="mt-3">
        <p className="font-mono text-lg font-semibold tracking-tight">
          {pot.display ||
            formatMoney(pot.balanceCents, pot.currencyCode, undefined, 0)}
        </p>

        {/* Target + progress */}
        {targetCents > 0 && (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              of {formatMoney(targetCents, pot.currencyCode, undefined, 0)}{" "}
              target
              {progressPct > 0 && ` · ${progressPct}%`}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  progressPct >= 100
                    ? "bg-success-foreground"
                    : progressPct >= 75
                      ? "bg-warning-foreground"
                      : "bg-foreground",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {canManage && (
        <div className="mt-4 flex gap-2">
          {onAddFunds && (
            <button
              onClick={() => onAddFunds(pot)}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-medium",
                "bg-muted transition-colors hover:bg-muted/80",
              )}
            >
              <ArrowUpToLine className="h-3.5 w-3.5" />
              Add
            </button>
          )}
          {onWithdraw && pot.balanceCents > 0 && (
            <button
              onClick={() => onWithdraw(pot)}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-medium",
                "bg-muted transition-colors hover:bg-muted/80",
              )}
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              Withdraw
            </button>
          )}
        </div>
      )}
    </div>
  );
}
