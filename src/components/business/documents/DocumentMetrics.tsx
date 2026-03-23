"use client";

import { cn } from "@/lib/utils";
import type { BusinessDocument } from "@/lib/business-types";

interface DocumentMetricsProps {
  documents: BusinessDocument[];
}

export function DocumentMetrics({ documents }: DocumentMetricsProps) {
  const total = documents.length;
  const active = documents.filter((d) => !d.isArchived).length;
  const archived = documents.filter((d) => d.isArchived).length;
  const expiring = documents.filter(
    (d) => d.expiresAt && new Date(d.expiresAt) < new Date(),
  ).length;

  const cards = [
    { label: "Total", value: total, accent: "" },
    { label: "Active", value: active, accent: "text-success-foreground" },
    { label: "Expired", value: expiring, accent: "text-destructive" },
    { label: "Archived", value: archived, accent: "text-warning-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "rounded-2xl bg-card p-4",
            "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {card.label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums",
              card.accent,
            )}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
