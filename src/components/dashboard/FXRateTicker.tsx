"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { FXRate } from "@/hooks/use-fx-rates";

interface FXRateTickerProps {
  rates: FXRate[];
  isLoading: boolean;
}

const INTERESTING_PAIRS = [
  { from: "USD", to: "ETB" },
  { from: "EUR", to: "ETB" },
  { from: "USD", to: "EUR" },
];

function formatRate(rate: number, to: string): string {
  return to === "EUR" || to === "USD" ? rate.toFixed(4) : rate.toFixed(2);
}

export function FXRateTicker({ rates, isLoading }: FXRateTickerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[60px] min-w-[140px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const pills = (rates ?? [])
    .filter((r) => INTERESTING_PAIRS.some((p) => p.from === r.from && p.to === r.to));

  if (pills.length === 0) {
    return (
      <div className="space-y-3">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Exchange rates
        </h2>
        <p className="text-xs text-muted-foreground">Rates unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Exchange rates
        </h2>
        <span className="flex items-center gap-1 text-[10px] font-medium text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-3">
        {pills.map((rate, i) => (
          <motion.div
            key={`${rate.from}-${rate.to}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
          >
            <Link
              href={`/convert?from=${rate.from}&to=${rate.to}`}
              className="flex min-w-[140px] flex-col gap-0.5 rounded-2xl bg-muted dark:border dark:border-border dark:bg-card px-4 py-3 transition-colors active:bg-muted"
            >
              <span className="text-sm font-semibold">
                {rate.from}/{rate.to}
              </span>
              <span className="font-tabular text-lg font-bold">
                {formatRate(rate.mid, rate.to)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
