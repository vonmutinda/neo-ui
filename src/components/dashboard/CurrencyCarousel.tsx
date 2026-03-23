"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { CurrencyBalance, SupportedCurrency } from "@/lib/types";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { formatMoney } from "@/lib/format";

interface CurrencyCarouselProps {
  balances: CurrencyBalance[];
  primaryCurrency: SupportedCurrency;
  onActiveCurrencyChange: (currency: SupportedCurrency) => void;
  onAddAccount?: () => void;
  showAddCard?: boolean;
}

const CURRENCY_NAMES: Record<string, string> = {
  ETB: "Ethiopian Birr",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  KES: "Kenyan Shilling",
};

/**
 * Currency tile tints — card/loans design language: border-border, muted/card gradients.
 */
const CURRENCY_TINTS: Record<string, string> = {
  ETB: "from-primary/10 to-primary/5 border-primary/15",
  USD: "from-blue-500/10 to-blue-500/5 border-blue-500/15",
  EUR: "from-indigo-500/10 to-indigo-500/5 border-indigo-500/15",
  GBP: "from-purple-500/10 to-purple-500/5 border-purple-500/15",
  KES: "from-orange-500/10 to-orange-500/5 border-orange-500/15",
};

const DEFAULT_TINT = "from-muted/40 to-muted/20 border-border/60";

export function CurrencyCarousel({
  balances,
  primaryCurrency,
  onActiveCurrencyChange,
  onAddAccount,
  showAddCard = true,
}: CurrencyCarouselProps) {
  useEffect(() => {
    onActiveCurrencyChange(primaryCurrency);
  }, [primaryCurrency, onActiveCurrencyChange]);

  const showCarousel = balances.length > 0 || showAddCard;
  if (!showCarousel) return null;

  function handleAddBalance(e: React.MouseEvent) {
    if (onAddAccount) {
      e.preventDefault();
      onAddAccount();
    }
  }

  return (
    <div
      className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 pt-0"
      style={{ scrollbarWidth: "none" }}
    >
      {balances.map((bal) => {
        const tint = CURRENCY_TINTS[bal.currency] ?? DEFAULT_TINT;
        return (
          <Link
            key={bal.currency}
            href={`/balances/${bal.currency}`}
            onClick={() => onActiveCurrencyChange(bal.currency)}
            className={`flex w-36 min-w-[9rem] shrink-0 flex-col justify-between rounded-xl border bg-gradient-to-br p-3 transition-all active:scale-[0.97] ${tint}`}
          >
            <CurrencyFlag currency={bal.currency} size="md" />
            <div className="mt-3">
              <p className="font-tabular text-base font-bold tracking-tight text-foreground">
                {formatMoney(bal.balanceCents, bal.currency)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {CURRENCY_NAMES[bal.currency] ?? bal.currency}
              </p>
            </div>
          </Link>
        );
      })}
      {showAddCard && (
        <Link
          href="/convert"
          onClick={handleAddBalance}
          className="flex w-36 min-w-[9rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 transition-all active:scale-[0.97] hover:bg-muted/50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-center text-xs font-medium text-muted-foreground">
            Add balance
          </p>
        </Link>
      )}
    </div>
  );
}
