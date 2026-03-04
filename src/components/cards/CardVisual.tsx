"use client";

import { motion } from "framer-motion";
import { Wifi, Snowflake } from "lucide-react";
import type { Card, CardType } from "@/lib/types";

const TYPE_GRADIENT: Record<CardType, string> = {
  virtual:
    "from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-500",
  physical:
    "from-slate-800 via-slate-700 to-slate-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700",
  ephemeral:
    "from-violet-600 via-purple-500 to-fuchsia-400 dark:from-violet-700 dark:via-purple-600 dark:to-fuchsia-500",
};

const TYPE_LABEL: Record<CardType, string> = {
  virtual: "Virtual Card",
  physical: "Physical Card",
  ephemeral: "Disposable Card",
};

export function CardVisual({
  card,
  compact,
}: {
  card: Card;
  compact?: boolean;
}) {
  const isFrozen = card.status === "frozen";
  const h = compact ? "h-44" : "h-52";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${TYPE_GRADIENT[card.type]} ${h} w-full p-5 text-white shadow-lg`}
    >
      {isFrozen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
            <Snowflake className="h-4 w-4" />
            Frozen
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider opacity-80">
          {TYPE_LABEL[card.type]}
        </span>
        {card.allowContactless && (
          <Wifi className="h-5 w-5 rotate-90 opacity-60" />
        )}
      </div>

      <div className="mt-auto pt-10">
        <p className="font-tabular text-lg tracking-[0.2em] opacity-90">
          •••• •••• •••• {card.lastFour}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider opacity-60">
            Expires
          </p>
          <p className="font-tabular text-sm">
            {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider opacity-60">
            Neo
          </p>
          <p className="text-sm font-bold tracking-wider">VISA</p>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
    </motion.div>
  );
}
