"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoansSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-24" />
      </div>

      {/* Eligibility banner */}
      <Skeleton className="h-20 rounded-2xl" />

      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      {/* Loan card */}
      <Skeleton className="h-48 rounded-2xl" />

      {/* Schedule table header */}
      <div className="hidden gap-4 px-5 py-3 md:grid md:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-16" />
        ))}
      </div>

      {/* Schedule rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid gap-4 px-5 py-3 md:grid-cols-6">
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}
