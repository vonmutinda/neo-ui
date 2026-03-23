"use client";

import { useAdminFeeSchedules } from "@/hooks/admin/use-admin-fees";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFeesPage() {
  const { data: schedules, isLoading } = useAdminFeeSchedules();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Fee schedules</h1>
      <p className="text-sm text-muted-foreground">
        Pricing rules for corridors and products.
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Active</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={3}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : !schedules || schedules.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No fee schedules
                </td>
              </tr>
            ) : (
              schedules.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.isActive ? "Yes" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
