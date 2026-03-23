"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 1. Greeting header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* 2. Currency carousel */}
      <div className="flex gap-2.5 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] min-w-[9rem] rounded-xl" />
        ))}
      </div>

      {/* 3. Quick actions */}
      <div className="flex gap-4 overflow-hidden px-1 md:justify-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>

      {/* 4. Pots */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-12" />
        <div className="flex gap-2.5 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] min-w-[7rem] rounded-xl" />
          ))}
        </div>
      </div>

      {/* 5. Recent activity */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <div className="rounded-2xl border border-border/60 bg-card">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 border-b border-border/60 px-3 py-2.5 last:border-0"
            >
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
