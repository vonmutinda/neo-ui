"use client";

import { useCallback, useMemo, useState } from "react";
import { useWalletSummary } from "@/hooks/use-wallets";
import { useBalances } from "@/hooks/use-balances";
import { usePots } from "@/hooks/use-pots";
import { useFXRates } from "@/hooks/use-fx-rates";
import { useAuthStore } from "@/providers/auth-store";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { CurrencyCarousel } from "@/components/dashboard/CurrencyCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PotsCarousel } from "@/components/dashboard/PotsCarousel";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FXRateTicker } from "@/components/dashboard/FXRateTicker";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FXRate } from "@/hooks/use-fx-rates";
import { useDisplayCurrency } from "@/lib/display-currency-store";
import type { SupportedCurrency } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useWalletSummary();
  const { data: balances } = useBalances();
  const { data: pots } = usePots();
  const { data: fxRates, isLoading: fxLoading } = useFXRates();
  const userProfile = useAuthStore((s) => s.userProfile);
  const queryClient = useQueryClient();
  const { displayCurrency } = useDisplayCurrency();

  const [, setActiveCurrency] = useState<SupportedCurrency>("ETB");

  const handleActiveCurrencyChange = useCallback(
    (currency: SupportedCurrency) => {
      setActiveCurrency(currency);
    },
    [],
  );

  const primaryCurrency = summary?.primaryCurrency ?? "ETB";
  const balanceList = useMemo(() => {
    if (!summary) return [];
    return (balances ?? summary.balances).map((bal) => {
      const currency = (
        "currencyCode" in bal ? bal.currencyCode : bal.currency
      ) as SupportedCurrency;
      const display = bal.display;
      const symbol = "symbol" in bal ? bal.symbol : "";
      const name = "name" in bal ? bal.name : currency;
      return {
        currency,
        symbol,
        name,
        balanceCents: bal.balanceCents,
        display,
      };
    });
  }, [summary, balances]);

  const hasMultipleCurrencies = balanceList.length > 1;
  const potsList = (pots ?? []).slice(0, 8);
  const allPotsCount = pots?.length ?? 0;

  // Hero balance: total if multi-currency, primary balance if single
  const heroBalanceCents = useMemo(() => {
    if (!hasMultipleCurrencies) {
      return balanceList[0]?.balanceCents ?? 0;
    }
    const targetCurrency = displayCurrency ?? primaryCurrency;
    const rates = fxRates ?? [];
    let total = 0;
    for (const bal of balanceList) {
      if (bal.currency === targetCurrency) {
        total += bal.balanceCents;
      } else {
        const rate = rates.find(
          (r: FXRate) =>
            (r.from === bal.currency && r.to === targetCurrency) ||
            (r.from === targetCurrency && r.to === bal.currency),
        );
        if (rate) {
          total +=
            rate.from === bal.currency
              ? Math.round(bal.balanceCents * rate.mid)
              : Math.round(bal.balanceCents / rate.mid);
        } else {
          total += bal.balanceCents;
        }
      }
    }
    return total;
  }, [
    balanceList,
    fxRates,
    primaryCurrency,
    displayCurrency,
    hasMultipleCurrencies,
  ]);

  const heroCurrencyLabel = hasMultipleCurrencies
    ? (displayCurrency ?? primaryCurrency)
    : (balanceList[0]?.currency ?? primaryCurrency);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-muted-foreground">Could not load your account</p>
        <button
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["wallets"] })
          }
          className="text-sm font-semibold text-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <GreetingHeader
        username={userProfile?.username}
        firstName={userProfile?.firstName}
        lastName={userProfile?.lastName}
      />

      {/* Currency balances carousel — primary focus (Wise-style) */}
      <section>
        <CurrencyCarousel
          balances={balanceList}
          primaryCurrency={primaryCurrency}
          onActiveCurrencyChange={handleActiveCurrencyChange}
          showAddCard
        />
        {hasMultipleCurrencies && (
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            Total in {heroCurrencyLabel}:{" "}
            {formatMoney(heroBalanceCents, heroCurrencyLabel)}
          </p>
        )}
      </section>

      {/* Quick Actions */}
      <QuickActions />

      {/* Pots carousel */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Pots
          </h2>
          {allPotsCount > 8 && (
            <Link
              href="/pots/new"
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        <PotsCarousel pots={potsList} allPotsCount={allPotsCount} />
      </section>

      {/* Recent Activity */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recent activity
          </h2>
          <Link
            href="/transactions"
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <RecentTransactions />
      </section>

      {/* FX Rates — multi-currency users */}
      {hasMultipleCurrencies && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Live rates
            </h2>
          </div>
          <FXRateTicker rates={fxRates ?? []} isLoading={fxLoading} />
        </section>
      )}
    </div>
  );
}
