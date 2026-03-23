"use client";

import { formatMoney } from "@/lib/format";
import { currencyFlag } from "@/lib/business-utils";
import { cn } from "@/lib/utils";
import type { BusinessCurrencyBalance } from "@/lib/business-types";

interface WalletsCurrencyGridProps {
  balances: BusinessCurrencyBalance[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

export function WalletsCurrencyGrid({
  balances,
  selectedCode,
  onSelect,
}: WalletsCurrencyGridProps) {
  if (balances.length === 0) return null;

  return (
    <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
      {balances.map((bal) => {
        const isSelected = bal.currencyCode === selectedCode;

        return (
          <button
            key={bal.id}
            type="button"
            onClick={() => onSelect(bal.currencyCode)}
            className={cn(
              "relative cursor-pointer rounded-2xl bg-background p-6 text-left",
              "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
              "transition-all duration-200",
              "hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
              isSelected && "ring-2 ring-primary",
              !isSelected && bal.isPrimary && "ring-2 ring-primary/20",
            )}
          >
            {bal.isPrimary && (
              <span className="absolute right-4 top-3 text-[10px] font-semibold text-primary">
                Primary
              </span>
            )}
            <p className="text-xl">{currencyFlag(bal.currencyCode)}</p>
            <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground">
              {bal.currencyCode}
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-tight">
              {formatMoney(bal.balanceCents, bal.currencyCode, undefined, 0)}
            </p>
          </button>
        );
      })}
    </div>
  );
}
