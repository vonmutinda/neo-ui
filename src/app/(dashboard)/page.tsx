"use client";

import { useCallback, useState } from "react";
import { useWalletSummary, useTransactions } from "@/hooks/use-wallets";
import { useBalances } from "@/hooks/use-balances";
import { usePots } from "@/hooks/use-pots";
import { useFXRates } from "@/hooks/use-fx-rates";
import { useOverdraft } from "@/hooks/use-overdraft";
import { useAuthStore } from "@/providers/auth-store";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { CurrencyCarousel } from "@/components/dashboard/CurrencyCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FXRateTicker } from "@/components/dashboard/FXRateTicker";
import { SpendingInsight } from "@/components/dashboard/SpendingInsight";
import { PotCard } from "@/components/dashboard/PotCard";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { SupportedCurrency } from "@/lib/types";
import { formatMoney } from "@/lib/format";

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useWalletSummary();
  const { data: balances } = useBalances();
  const { data: pots } = usePots();
  const { data: fxRates, isLoading: fxLoading } = useFXRates();
  const { data: transactions } = useTransactions();
  const { data: overdraft } = useOverdraft();
  const userProfile = useAuthStore((s) => s.userProfile);
  const queryClient = useQueryClient();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 80], [0, 1]);

  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>("ETB");

  const handleActiveCurrencyChange = useCallback((currency: SupportedCurrency) => {
    setActiveCurrency(currency);
  }, []);

  function handleDragEnd() {
    if (y.get() > 60) {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["pots"] });
      queryClient.invalidateQueries({ queryKey: ["fx"] });
    }
    animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-muted-foreground">Could not load your account</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["wallets"] })}
          className="text-sm font-semibold text-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  const primaryCurrency = summary.primaryCurrency;
  const balanceList = (balances ?? summary.balances).map((bal) => {
    const currency = ("currencyCode" in bal ? bal.currencyCode : bal.currency) as SupportedCurrency;
    const display = bal.display;
    const symbol = "symbol" in bal ? bal.symbol : "";
    const name = "name" in bal ? bal.name : currency;
    return { currency, symbol, name, balanceCents: bal.balanceCents, display };
  });

  return (
    <div ref={constraintsRef} className="relative">
      <motion.div
        className="absolute left-1/2 top-0 -translate-x-1/2"
        style={{ opacity }}
      >
        <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
      </motion.div>

      <motion.div
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        className="space-y-10"
      >
        {/* 1. Greeting */}
        <GreetingHeader
          username={userProfile?.username}
          firstName={userProfile?.firstName}
          lastName={userProfile?.lastName}
        />

        {/* Overdraft in-use banner */}
        {overdraft?.status === "used" && (
          <Link
            href="/loans"
            className="block rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm"
          >
            <span className="font-medium text-foreground">
              You&apos;re using {formatMoney(overdraft.usedCents, "ETB")} of your overdraft.
            </span>
            <span className="ml-1 text-primary">Pay off →</span>
          </Link>
        )}

        {/* 2. Currency carousel */}
        <CurrencyCarousel
          balances={balanceList}
          primaryCurrency={primaryCurrency}
          onActiveCurrencyChange={handleActiveCurrencyChange}
        />

        {/* 3. Quick actions */}
        <QuickActions />

        {/* 4. FX rate ticker */}
        <FXRateTicker rates={fxRates ?? []} isLoading={fxLoading} />

        {/* 5. Pots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Pots
            </h2>
            <Link
              href="/pots/new"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> New pot
            </Link>
          </div>
          {pots && pots.length > 0 ? (
            pots.map((pot, i) => <PotCard key={pot.id} pot={pot} index={i} />)
          ) : (
            <div className="rounded-2xl bg-muted p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No pots yet. Create one to start saving!
              </p>
            </div>
          )}
        </div>

        {/* 6. Spending insight */}
        {transactions && transactions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Today
            </h2>
            <SpendingInsight transactions={transactions} />
          </div>
        )}

        {/* 7. Recent activity */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Recent activity
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <RecentTransactions />
        </div>
      </motion.div>
    </div>
  );
}
