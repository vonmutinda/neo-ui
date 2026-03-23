"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function InvoicesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Table header */}
      <div className="hidden gap-4 px-5 py-3 md:grid md:grid-cols-[0.8fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr]">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="grid gap-4 px-5 py-4 md:grid-cols-[0.8fr_1.2fr_0.8fr_0.6fr_0.6fr_0.6fr]"
        >
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
