import { Skeleton } from "@/components/ui/skeleton";

export function BusinessDashboardSkeleton() {
  return (
    <div className="animate-in fade-in">
      {/* Hero */}
      <div className="mb-10">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-12 w-72" />
        <Skeleton className="mt-3 h-4 w-56" />
      </div>

      {/* Quick actions */}
      <div className="mb-10 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-32 rounded-full" />
        ))}
      </div>

      {/* Currency cards */}
      <div className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>

      {/* Two column */}
      <div className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
