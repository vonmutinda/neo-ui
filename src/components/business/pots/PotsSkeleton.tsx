"use client";

import { cn } from "@/lib/utils";

export function PotsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-24 rounded-lg bg-muted" />
        <div className="h-10 w-28 rounded-xl bg-muted" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-muted" />
        ))}
      </div>

      {/* Pot grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl bg-card p-5 space-y-3",
              "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
            )}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-6 w-32 rounded bg-muted" />
            <div className="h-1.5 w-full rounded-full bg-muted" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded-xl bg-muted" />
              <div className="h-9 flex-1 rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
