"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminBusinesses } from "@/hooks/admin/use-admin-businesses";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function BusinessesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<{
    limit: number;
    offset: number;
    search?: string;
    status?: string;
  }>({ limit: 20, offset: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useAdminBusinesses(filter);

  function handleSearch() {
    setFilter((f) => ({ ...f, search: search || undefined, offset: 0 }));
  }

  function handleStatusChange(status: string) {
    setStatusFilter(status);
    setFilter((f) => ({ ...f, status: status || undefined, offset: 0 }));
  }

  const items = Array.isArray(data?.data) ? data.data : [];
  const pagination = data && "pagination" in data ? data.pagination : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by business name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 rounded-[10px] pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-10 rounded-[10px] border border-border bg-card px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="deactivated">Deactivated</option>
        </select>
        <Button variant="secondary" size="sm" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">KYB Level</th>
              <th className="px-4 py-3 font-semibold">Market</th>
              <th className="px-4 py-3 font-semibold">Frozen</th>
              <th className="px-4 py-3 font-semibold">Created</th>
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
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No businesses found
                </td>
              </tr>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items.map((b: any) => (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/admin/businesses/${b.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-medium">
                    {String(b.name ?? "—")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status ?? "unknown"} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={`level_${b.kybLevel ?? 0}`} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {String(b.market ?? "—")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.isFrozen ? "frozen" : "active"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {pagination.offset + 1}–
            {Math.min(pagination.offset + pagination.limit, pagination.total)}{" "}
            of {pagination.total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)),
                }))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  offset: (f.offset ?? 0) + (f.limit ?? 20),
                }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
