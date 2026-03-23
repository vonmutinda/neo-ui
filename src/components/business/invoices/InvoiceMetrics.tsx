"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { InvoiceSummary } from "@/lib/business-types";

interface InvoiceMetricsProps {
  summary: InvoiceSummary;
  currencyCode: string;
}

export function InvoiceMetrics({ summary, currencyCode }: InvoiceMetricsProps) {
  const cards = [
    {
      label: "Total Invoiced",
      amount: summary.totalInvoicedCents ?? 0,
      count: summary.totalInvoices ?? 0,
      accent: "",
    },
    {
      label: "Outstanding",
      amount: summary.outstandingCents ?? 0,
      count: summary.outstandingCount ?? 0,
      accent: "text-muted-foreground",
    },
    {
      label: "Overdue",
      amount: summary.overdueCents ?? 0,
      count: summary.overdueCount ?? 0,
      accent: "text-destructive",
    },
    {
      label: "Collected",
      amount: summary.collectedCents ?? 0,
      count: undefined,
      accent: "text-success-foreground",
    },
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
              "mt-1 font-mono text-lg font-semibold tracking-tight",
              card.accent,
            )}
          >
            {formatMoney(card.amount, currencyCode, undefined, 0)}
          </p>
          {card.count !== undefined && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {card.count} {card.count === 1 ? "invoice" : "invoices"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
