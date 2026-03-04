"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useBalances, useCreateBalance } from "@/hooks/use-balances";
import { useTelegram } from "@/providers/TelegramProvider";
import { toast } from "sonner";
import type { SupportedCurrency, CurrencyBalanceDetail } from "@/lib/types";

const ALL_CURRENCIES: { code: SupportedCurrency; name: string; flag: string }[] = [
  { code: "ETB", name: "Ethiopian Birr", flag: "🇪🇹" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
];

export default function BalancesPage() {
  const { haptic } = useTelegram();
  const { data: balances, isLoading } = useBalances();
  const createBalance = useCreateBalance();
  const [showAdd, setShowAdd] = useState(false);

  const activeCodes = new Set(balances?.map((b) => b.currencyCode) ?? []);
  const addableCurrencies = ALL_CURRENCIES.filter((c) => !activeCodes.has(c.code));

  async function handleAdd(code: SupportedCurrency) {
    try {
      await createBalance.mutateAsync({ currencyCode: code });
      haptic("medium");
      setShowAdd(false);
    } catch (err) {
      haptic("heavy");
      toast.error(err instanceof Error ? err.message : "Failed to add currency");
    }
  }

  function BalanceCard({ bal, index }: { bal: CurrencyBalanceDetail; index: number }) {
    const meta = ALL_CURRENCIES.find((c) => c.code === bal.currencyCode);

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border"
      >
        <Link
          href={`/balances/${bal.currencyCode}`}
          className="flex w-full items-center gap-4 p-4 transition-colors active:bg-muted"
        >
          <span className="text-2xl">{meta?.flag ?? "💱"}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{bal.currencyCode}</span>
              <span className="font-semibold tabular-nums">{bal.display}</span>
            </div>
            <span className="text-xs text-muted-foreground">{meta?.name}</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Currency Balances</h1>
        </div>
        {addableCurrencies.length > 0 && (
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Add currency selector */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 rounded-2xl border border-dashed bg-muted dark:bg-card dark:border dark:border-border p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Add a currency</p>
              {addableCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleAdd(c.code)}
                  disabled={createBalance.isPending}
                  className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted active:bg-muted"
                >
                  <span className="text-xl">{c.flag}</span>
                  <div className="text-left">
                    <span className="text-sm font-medium">{c.code}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{c.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active balances */}
      <div className="space-y-3">
        {balances?.map((bal, i) => (
          <BalanceCard key={bal.id} bal={bal} index={i} />
        ))}
        {(!balances || balances.length === 0) && (
          <div className="rounded-2xl border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">No active currencies</p>
          </div>
        )}
      </div>
    </div>
  );
}
