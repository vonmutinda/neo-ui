"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminKYBSubmissions } from "@/hooks/admin/use-admin-kyb";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function KYBPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminKYBSubmissions();

  function handleStatusChange(status: string) {
    setStatusFilter(status);
  }

  const allItems = Array.isArray(data) ? data : [];
  const items = statusFilter
    ? allItems.filter((s) => s.status === statusFilter)
    : allItems;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-10 rounded-[10px] border border-border bg-card px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Business ID</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Submitted At</th>
              <th className="px-4 py-3 font-semibold">Reviewed At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No KYB submissions found
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((s: any) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/kyb/${s.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium">
                    {String(s.businessId ?? s.id ?? "—")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status ?? "unknown"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.reviewedAt
                      ? new Date(s.reviewedAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
