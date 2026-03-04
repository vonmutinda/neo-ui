"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Greeting header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* 2. Hero balance */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* 3. Quick actions */}
      <div className="flex gap-4 overflow-hidden px-1 md:justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-14 w-14 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>

      {/* 4. Currency cards */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
      </div>

      {/* 5. FX ticker */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-3 overflow-hidden md:grid md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[60px] min-w-[140px] rounded-2xl" />
          ))}
        </div>
      </div>

      {/* 6. Pots */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-12" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-2xl" />
        ))}
      </div>

      {/* 7. Spending insight */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-[80px] rounded-2xl" />
      </div>

      {/* 8. Recent activity */}
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
