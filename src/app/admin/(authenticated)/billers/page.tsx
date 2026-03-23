"use client";

import { useAdminBillers } from "@/hooks/admin/use-admin-billers";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminBillersPage() {
  const { data, isLoading } = useAdminBillers(50, 0);
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billers</h1>
      <p className="text-sm text-muted-foreground">
        ET billers available for bill pay (read-only list).
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Active</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No billers
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3 font-mono text-xs">{b.code}</td>
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3">{b.category ?? "—"}</td>
                  <td className="px-4 py-3">{b.isActive ? "Yes" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
