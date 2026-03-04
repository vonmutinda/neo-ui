"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCards } from "@/hooks/admin/use-admin-cards";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { CardFilter } from "@/lib/admin-types";
import type { CardType, CardStatus } from "@/lib/types";

const CARD_TYPES: CardType[] = ["physical", "virtual", "ephemeral"];
const CARD_STATUSES: CardStatus[] = ["active", "frozen", "cancelled", "expired", "pending_activation"];

export default function CardsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CardFilter>({ limit: 20, offset: 0 });
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminCards(filter);

  function handleSearch() {
    setFilter((f) => ({ ...f, search: search || undefined, offset: 0 }));
  }

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by card ID or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="h-10 rounded-[10px] pl-10"
          />
        </div>
        <select
          value={filter.type ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, type: (e.target.value as CardType) || undefined, offset: 0 }))}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All types</option>
          {CARD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filter.status ?? ""}
          onChange={(e) => setFilter((f) => ({ ...f, status: (e.target.value as CardStatus) || undefined, offset: 0 }))}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {CARD_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Card ID</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Last Four</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Daily Limit</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No cards found</td>
              </tr>
            ) : (
              items.map((card) => (
                <tr
                  key={card.id}
                  onClick={() => router.push(`/admin/cards/${card.id}`)}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">{card.id?.slice(0, 8) ?? "—"}...</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{card.userId?.slice(0, 8) ?? "—"}...</td>
                  <td className="px-4 py-3 font-tabular">****{card.lastFour ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={card.type ?? "unknown"} /></td>
                  <td className="px-4 py-3"><StatusBadge status={card.status ?? "unknown"} /></td>
                  <td className="px-4 py-3 font-tabular">{((card.dailyLimitCents ?? 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(card.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() => setFilter((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + (f.limit ?? 20) }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
