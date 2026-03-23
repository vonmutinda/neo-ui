"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function WalletsSkeleton() {
  return (
    <div className="animate-in fade-in">
      {/* Hero */}
      <div className="mb-10">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-2 h-12 w-72" />
        <Skeleton className="mt-3 h-4 w-56" />
      </div>

      {/* Quick actions */}
      <div className="mb-10 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Currency grid */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      {/* Two column */}
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
