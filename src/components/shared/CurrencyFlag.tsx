"use client";

import type { SupportedCurrency } from "@/lib/types";

const FLAGS: Record<SupportedCurrency, { emoji: string; bg: string }> = {
  ETB: { emoji: "🇪🇹", bg: "bg-primary/10" },
  USD: { emoji: "🇺🇸", bg: "bg-accent/10" },
  EUR: { emoji: "🇪🇺", bg: "bg-secondary" },
  GBP: { emoji: "🇬🇧", bg: "bg-blue-500/10" },
  AED: { emoji: "🇦🇪", bg: "bg-emerald-500/10" },
  SAR: { emoji: "🇸🇦", bg: "bg-green-500/10" },
  CNY: { emoji: "🇨🇳", bg: "bg-red-500/10" },
  KES: { emoji: "🇰🇪", bg: "bg-orange-500/10" },
};

export function CurrencyFlag({
  currency,
  size = "md",
}: {
  currency: SupportedCurrency;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const flag = FLAGS[currency];
  const sizeClass = {
    xs: "h-5 w-5 text-xs",
    sm: "h-8 w-8 text-base",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-3xl",
    xl: "h-16 w-16 text-4xl",
  }[size];

  return (
    <div
      className={`${flag.bg} ${sizeClass} flex items-center justify-center rounded-full`}
    >
      {flag.emoji}
    </div>
  );
}
