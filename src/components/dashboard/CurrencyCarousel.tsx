"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { CurrencyBalance, SupportedCurrency } from "@/lib/types";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";

interface CurrencyCarouselProps {
  balances: CurrencyBalance[];
  primaryCurrency: SupportedCurrency;
  onActiveCurrencyChange: (currency: SupportedCurrency) => void;
}

export function CurrencyCarousel({
  balances,
  primaryCurrency,
  onActiveCurrencyChange,
}: CurrencyCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function handleScroll() {
      if (!el) return;
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 12
        : 292;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(idx);
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (balances[activeIndex]) {
      const currency = balances[activeIndex].currency;
      onActiveCurrencyChange(currency);
    }
  }, [activeIndex, balances, onActiveCurrencyChange]);

  if (balances.length === 0) return null;

  return (
    <div className="space-y-3">
      <div
        ref={scrollRef}
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 md:-mx-0 md:px-0"
        style={{ scrollbarWidth: "none" }}
      >
        {balances.map((bal, i) => {
          const isPrimary = bal.currency === primaryCurrency;
          const isActive = i === activeIndex;

          return (
            <motion.div
              key={bal.currency}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="snap-center"
            >
              <Link
                href={`/balances/${bal.currency}`}
                className={cn(
                  "flex min-w-[280px] flex-col gap-4 rounded-2xl p-5 transition-colors active:opacity-90",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <CurrencyFlag currency={bal.currency} size="sm" />
                  <span className="text-sm font-semibold">
                    {bal.name || bal.currency}
                  </span>
                  {isPrimary && (
                    <span
                      className={cn(
                        "ml-auto rounded-3xl px-2 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      Primary
                    </span>
                  )}
                </div>
                <p className="font-tabular text-3xl font-semibold tracking-tight">
                  {formatMoney(bal.balanceCents, bal.currency)}
                </p>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {bal.currency} balance
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Dot indicators */}
      {balances.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {balances.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
