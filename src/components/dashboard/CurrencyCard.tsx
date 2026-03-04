"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CurrencyBalance } from "@/lib/types";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

interface CurrencyCardProps {
  balance: CurrencyBalance;
  index: number;
  isPrimary?: boolean;
}

export function CurrencyCard({
  balance,
  index,
  isPrimary = false,
}: CurrencyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        href={`/balances/${balance.currency}`}
        className={cn(
          "flex items-center gap-4 rounded-2xl bg-muted dark:border dark:border-border dark:bg-card p-4 transition-colors active:bg-muted",
          isPrimary && "ring-2 ring-primary/20",
        )}
      >
        <CurrencyFlag currency={balance.currency} />
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {balance.name}
          </p>
          <p
            className={cn(
              "font-tabular font-semibold",
              isPrimary ? "text-xl font-bold" : "text-lg",
            )}
          >
            {formatMoney(balance.balanceCents, balance.currency)}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {balance.currency}
        </span>
      </Link>
    </motion.div>
  );
}
