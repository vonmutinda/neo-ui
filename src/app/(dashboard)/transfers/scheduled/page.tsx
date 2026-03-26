"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Plus, Calendar, User, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useScheduledTransfers } from "@/hooks/use-scheduled-transfers";
import { formatMoney } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-muted text-muted-foreground border-border/60",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ScheduledTransfersPage() {
  const { data: transfers, isLoading } = useScheduledTransfers();
  const [search, setSearch] = useState("");

  const filtered = transfers?.filter(
    (t) =>
      t.recipient.toLowerCase().includes(search.toLowerCase()) ||
      t.narration?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Transfers"
        backHref="/"
        rightSlot={
          <Link href="/transfers/scheduled/new">
            <Button size="sm" className="gap-1.5 rounded-xl">
              <Plus className="h-4 w-4" /> New
            </Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search transfers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!filtered || filtered.length === 0) && (
        <EmptyState
          icon={Clock}
          title="No scheduled transfers"
          description="Set up recurring transfers to automate your payments."
          actionLabel="Create Schedule"
          actionHref="/transfers/scheduled/new"
        />
      )}

      {/* Transfer list */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((transfer, i) => (
            <motion.div
              key={transfer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/transfers/scheduled/${transfer.id}`}>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors active:bg-muted">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {transfer.recipient}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_STYLES[transfer.status] ?? ""}`}
                      >
                        {transfer.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{transfer.frequency}</span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {transfer.nextRunAt
                          ? formatDate(transfer.nextRunAt)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tabular-nums">
                      {formatMoney(transfer.amountCents, transfer.currency)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
