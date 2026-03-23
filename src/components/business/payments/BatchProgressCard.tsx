"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { BatchPayment } from "@/lib/business-types";

interface BatchProgressCardProps {
  batch: BatchPayment;
}

export function BatchProgressCard({ batch }: BatchProgressCardProps) {
  const counts = useMemo(() => {
    const items = batch.items ?? [];
    const completed = items.filter((i) => i.status === "completed").length;
    const processing = items.filter((i) => i.status === "processing").length;
    const failed = items.filter((i) => i.status === "failed").length;
    const pending = items.filter((i) => i.status === "pending").length;
    const total = items.length || batch.itemCount;
    return { completed, processing, failed, pending, total };
  }, [batch]);

  if (counts.total === 0) return null;

  const pctCompleted = (counts.completed / counts.total) * 100;
  const pctProcessing = (counts.processing / counts.total) * 100;
  const pctFailed = (counts.failed / counts.total) * 100;

  return (
    <div
      className={cn(
        "rounded-2xl p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      {/* Count label */}
      <p className="mb-3 text-sm font-medium text-foreground">
        {counts.completed} of {counts.total} completed
      </p>

      {/* Progress bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {pctCompleted > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${pctCompleted}%` }}
          />
        )}
        {pctProcessing > 0 && (
          <div
            className="bg-amber-500 transition-all duration-500"
            style={{ width: `${pctProcessing}%` }}
          />
        )}
        {pctFailed > 0 && (
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${pctFailed}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Completed {counts.completed}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
          Processing {counts.processing}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          Failed {counts.failed}
        </div>
        {counts.pending > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            Pending {counts.pending}
          </div>
        )}
      </div>
    </div>
  );
}
