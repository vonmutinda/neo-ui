"use client";

import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

interface BusinessHeroBalanceProps {
  firstName: string | undefined | null;
  totalCents: number;
  primaryCurrency: SupportedCurrency;
  currencyCount: number;
  kybLevel: number;
}

export function BusinessHeroBalance({
  firstName,
  totalCents,
  primaryCurrency,
  currencyCount,
  kybLevel,
}: BusinessHeroBalanceProps) {
  const displayName = firstName || "there";
  const formatted = formatMoney(totalCents, primaryCurrency, undefined, 0);

  return (
    <div className="mb-10">
      <p className="text-sm text-muted-foreground">
        {getGreeting()}, {displayName}
      </p>
      <h1 className="mt-1 font-mono text-5xl font-semibold tracking-tighter text-foreground">
        {formatted}
      </h1>
      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-success-foreground">
          &#8593; 12.4% this month
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>
          {currencyCount} {currencyCount === 1 ? "currency" : "currencies"}
        </span>
        <span className="h-1 w-1 rounded-full bg-border" />
        <span>KYB Level {kybLevel}</span>
      </div>
    </div>
  );
}
