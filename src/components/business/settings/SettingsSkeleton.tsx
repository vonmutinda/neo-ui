"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Skeleton className="h-7 w-28" />

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Nav skeleton */}
        <div className="flex w-[200px] shrink-0 flex-col gap-2">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 flex flex-col gap-5 max-w-lg">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
