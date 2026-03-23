"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { Skeleton } from "@/components/ui/skeleton";
import { useBalances } from "@/hooks/use-balances";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

const ORDER: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

export default function BalancesPage() {
  const { data: balances, isLoading } = useBalances();

  const sorted = [...(balances ?? [])].sort(
    (a, b) =>
      ORDER.indexOf(a.currencyCode as SupportedCurrency) -
      ORDER.indexOf(b.currencyCode as SupportedCurrency),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Balances" backHref="/" />

      <p className="text-sm text-muted-foreground">
        Tap a currency to open its wallet, send, and receive actions.
      </p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No currency balances yet. Add one from the home screen.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((b) => (
          <Link
            key={b.currencyCode}
            href={`/balances/${b.currencyCode}`}
            className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-4 shadow-sm transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <CurrencyFlag
                currency={b.currencyCode as SupportedCurrency}
                size="md"
              />
              <div>
                <p className="font-semibold text-foreground">
                  {b.currencyCode}
                </p>
                <p className="text-xs text-muted-foreground">
                  {b.isPrimary ? "Primary" : "Balance"} · {b.display}
                </p>
              </div>
            </div>
            <p className="font-tabular text-lg font-semibold text-foreground">
              {formatMoney(b.balanceCents, b.currencyCode as SupportedCurrency)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
