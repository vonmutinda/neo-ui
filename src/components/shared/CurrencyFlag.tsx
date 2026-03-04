"use client";

import type { SupportedCurrency } from "@/lib/types";

const FLAGS: Record<SupportedCurrency, { emoji: string; bg: string }> = {
  ETB: { emoji: "🇪🇹", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  USD: { emoji: "🇺🇸", bg: "bg-blue-100 dark:bg-blue-900/30" },
  EUR: { emoji: "🇪🇺", bg: "bg-indigo-100 dark:bg-indigo-900/30" },
};

export function CurrencyFlag({
  currency,
  size = "md",
}: {
  currency: SupportedCurrency;
  size?: "sm" | "md" | "lg";
}) {
  const flag = FLAGS[currency];
  const sizeClass = {
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-3xl",
  }[size];

  return (
    <div
      className={`${flag.bg} ${sizeClass} flex items-center justify-center rounded-full`}
    >
      {flag.emoji}
    </div>
  );
}
