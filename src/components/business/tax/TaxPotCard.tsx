// DEPRECATED: Tax pots are now part of the general Pots system.
// This component is kept for backwards compatibility but should not be used.
// Use components/business/pots/PotCard.tsx instead.
"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getTaxTypeLabel } from "@/lib/business-utils";
import { Pencil, ArrowDownToLine } from "lucide-react";
import type { BusinessPot } from "@/lib/business-types";

interface TaxPotCardProps {
  pot: BusinessPot;
  currencyCode: string;
  canManage: boolean;
  onEdit?: (pot: BusinessPot) => void;
  onWithdraw?: (pot: BusinessPot) => void;
}

export function TaxPotCard({
  pot,
  currencyCode,
  canManage,
  onEdit,
  onWithdraw,
}: TaxPotCardProps) {
  const balance = pot.balanceCents ?? 0;
  const target = pot.targetCents ?? 0;
  const progressPct =
    target > 0 ? Math.min(100, Math.round((balance / target) * 100)) : 0;

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        "transition-all hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {pot.taxDetails?.taxType
            ? getTaxTypeLabel(pot.taxDetails.taxType)
            : pot.name}
        </p>
      </div>

      <div className="mt-3">
        <p className="font-mono text-lg font-semibold tracking-tight">
          {formatMoney(balance, currencyCode, undefined, 0)}
        </p>
        {target > 0 && (
          <>
            <p className="mt-0.5 text-xs text-muted-foreground">
              of {formatMoney(target, currencyCode, undefined, 0)} target
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

      {canManage && (
        <div className="mt-4 flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(pot)}
              className={cn(
                "flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-medium",
                "bg-muted transition-colors hover:bg-muted/80",
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
          {onWithdraw && balance > 0 && (
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
