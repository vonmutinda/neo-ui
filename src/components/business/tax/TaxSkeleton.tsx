"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TaxSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Content area */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* List */}
        <div className="space-y-0 overflow-hidden rounded-2xl">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-3 w-3 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        {/* Chart */}
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
