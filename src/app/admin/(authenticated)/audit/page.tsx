"use client";

import { useState } from "react";
import { useAdminAuditLog } from "@/hooks/admin/use-admin-audit";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { AuditFilter } from "@/lib/admin-types";

const PAGE_SIZE = 20;

export default function AuditPage() {
  const [filter, setFilter] = useState<AuditFilter>({ limit: PAGE_SIZE, offset: 0 });
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminAuditLog(filter);

  function handleSearch() {
    setFilter((f) => ({ ...f, search: search || undefined, offset: 0 }));
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const truncate = (id: string) => (id ? id.slice(0, 8) + "..." : "—");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search audit log..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 rounded-[10px] pl-10"
          />
        </div>
        <select
          value={filter.action ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, action: e.target.value || undefined, offset: 0 }))}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All actions</option>
          <option value="create">create</option>
          <option value="update">update</option>
          <option value="delete">delete</option>
          <option value="read">read</option>
        </select>
        <select
          value={filter.actorType ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, actorType: e.target.value || undefined, offset: 0 }))}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All actor types</option>
          <option value="staff">staff</option>
          <option value="system">system</option>
          <option value="user">user</option>
        </select>
        <select
          value={filter.resourceType ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, resourceType: e.target.value || undefined, offset: 0 }))}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All resource types</option>
          <option value="user">user</option>
          <option value="transaction">transaction</option>
          <option value="loan">loan</option>
          <option value="card">card</option>
        </select>
        <Button variant="secondary" size="sm" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Timestamp</th>
              <th className="px-4 py-3 font-semibold">Action</th>
              <th className="px-4 py-3 font-semibold">Actor Type</th>
              <th className="px-4 py-3 font-semibold">Actor ID</th>
              <th className="px-4 py-3 font-semibold">Resource Type</th>
              <th className="px-4 py-3 font-semibold">Resource ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No audit entries found
                </td>
              </tr>
            ) : (
              items.map((entry) => (
                <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={entry.action} />
                  </td>
                  <td className="px-4 py-3">{entry.actorType ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{truncate(entry.actorId)}</td>
                  <td className="px-4 py-3">{entry.resourceType ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{truncate(entry.resourceId)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
            {pagination.total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() => setFilter((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - PAGE_SIZE) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + PAGE_SIZE }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
