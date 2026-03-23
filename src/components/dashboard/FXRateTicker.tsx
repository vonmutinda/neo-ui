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
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto md:grid md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[52px] min-w-[120px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const pills = (rates ?? []).filter((r) =>
    INTERESTING_PAIRS.some((p) => p.from === r.from && p.to === r.to),
  );

  if (pills.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Rates unavailable right now.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto md:grid md:grid-cols-3">
        {pills.map((rate, i) => (
          <motion.div
            key={`${rate.from}-${rate.to}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <Link
              href={`/convert?from=${rate.from}&to=${rate.to}`}
              className="flex min-w-[120px] flex-col gap-0.5 rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-[0_1px_2px_oklch(0.40_0.06_70/5%)] transition-colors hover:bg-muted/40 hover:border-primary/20 active:bg-muted"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {rate.from}/{rate.to}
              </span>
              <span className="font-tabular text-base font-bold">
                {formatRate(rate.mid, rate.to)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
