"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Calendar,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useSpendingByCategory,
  useSpendingSummary,
  useSpendingTrends,
} from "@/hooks/use-analytics";
import { formatMoney } from "@/lib/format";

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-orange-500",
  transport: "bg-blue-500",
  utilities: "bg-yellow-500",
  entertainment: "bg-purple-500",
  shopping: "bg-pink-500",
  health: "bg-green-500",
  education: "bg-indigo-500",
  rent: "bg-red-500",
  other: "bg-gray-500",
};

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.other;
}

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading } = useSpendingSummary();
  const { data: categories, isLoading: categoriesLoading } =
    useSpendingByCategory();
  const { data: trends, isLoading: trendsLoading } = useSpendingTrends();

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" backHref="/" />

      {/* Summary cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
              <ArrowDownLeft className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums text-success">
              {formatMoney(summary.totalInCents, summary.currency)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              In
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            </div>
            <p className="mt-2 text-lg font-bold tabular-nums">
              {formatMoney(summary.totalOutCents, summary.currency)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Out
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border/60 bg-card p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Minus className="h-4 w-4 text-primary" />
            </div>
            <p
              className={`mt-2 text-lg font-bold tabular-nums ${
                summary.netCents >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {formatMoney(Math.abs(summary.netCents), summary.currency)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Net
            </p>
          </motion.div>
        </div>
      ) : null}

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-muted-foreground">
          Spending by Category
        </h2>

        {categoriesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 flex-1 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
            {categories.map((cat, i) => {
              const maxAmount = Math.max(
                ...categories.map((c) => c.totalCents),
              );
              const pct =
                maxAmount > 0 ? (cat.totalCents / maxAmount) * 100 : 0;
              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">
                      {cat.category}
                    </span>
                    <span className="tabular-nums font-semibold">
                      {formatMoney(cat.totalCents, summary?.currency ?? "ETB")}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-background/50">
                    <motion.div
                      className={`h-full rounded-full ${getCategoryColor(cat.category)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.3 + i * 0.04,
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No spending data"
            description="Your category breakdown will appear once you make transactions."
          />
        )}
      </motion.div>

      {/* Monthly trends */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-muted-foreground">
          Monthly Trends
        </h2>

        {trendsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : trends && trends.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {trends.map((month, i) => (
              <motion.div
                key={month.month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3 border-b border-border/40 px-4 py-3 last:border-b-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{month.month}</p>
                </div>
                <div className="flex items-center gap-3 text-sm tabular-nums">
                  <span className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-3 w-3" />
                    {formatMoney(month.inCents, summary?.currency ?? "ETB")}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <TrendingDown className="h-3 w-3" />
                    {formatMoney(month.outCents, summary?.currency ?? "ETB")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No trend data available yet.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
