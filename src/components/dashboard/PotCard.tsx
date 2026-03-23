"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Pot } from "@/lib/types";
import { PotProgressRing } from "./PotProgressRing";
import { formatMoney } from "@/lib/format";

interface PotCardProps {
  pot: Pot;
  index: number;
  compact?: boolean;
}

export function PotCard({ pot, index, compact = false }: PotCardProps) {
  const progress =
    pot.targetCents && pot.targetCents > 0
      ? Math.min((pot.balanceCents / pot.targetCents) * 100, 100)
      : 0;

  const hasTarget = pot.targetCents != null && pot.targetCents > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <Link
        href={`/pots/${pot.id}`}
        className={
          compact
            ? "flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 transition-colors hover:bg-primary/5 active:bg-primary/10"
            : "flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-primary/5 active:bg-primary/10"
        }
      >
        <div
          className={
            compact
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl"
          }
        >
          {pot.emoji ?? "🏦"}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{pot.name}</span>
          <span className="block font-tabular text-sm font-semibold">
            {formatMoney(pot.balanceCents, pot.currencyCode)}
          </span>
        </div>

        {hasTarget && <PotProgressRing percent={progress} />}
      </Link>
    </motion.div>
  );
}
