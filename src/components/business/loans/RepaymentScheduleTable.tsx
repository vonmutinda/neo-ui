"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { Check } from "lucide-react";
import type { LoanRepayment } from "@/lib/business-types";

interface RepaymentScheduleTableProps {
  schedule: LoanRepayment[];
  currencyCode: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isUpcoming(dueDate: string, isPaid: boolean): boolean {
  if (isPaid) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

export function RepaymentScheduleTable({
  schedule,
  currencyCode,
}: RepaymentScheduleTableProps) {
  if (schedule.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        No repayment schedule available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      {/* Header */}
      <div className="hidden gap-4 bg-muted/30 px-5 py-3 md:grid md:grid-cols-[0.4fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          #
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Due Date
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
          Principal
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
          Interest
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
          Total
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">
          Status
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {schedule.map((r, idx) => {
          const upcoming = isUpcoming(r.dueDate, r.isPaid);

          return (
            <div
              key={r.id}
              className={cn(
                "grid gap-2 px-5 py-3.5 md:grid-cols-[0.4fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] md:items-center md:gap-4",
                r.isPaid && "opacity-60",
                upcoming && "bg-warning/5",
              )}
            >
              {/* Index */}
              <p className="text-sm tabular-nums text-muted-foreground">
                {idx + 1}
              </p>

              {/* Due date */}
              <p
                className={cn(
                  "text-sm",
                  upcoming
                    ? "font-medium text-warning-foreground"
                    : "text-foreground",
                )}
              >
                {formatDate(r.dueDate)}
              </p>

              {/* Principal */}
              <p className="font-mono text-sm tracking-tight md:text-right">
                {formatMoney(r.principalCents, currencyCode, undefined, 0)}
              </p>

              {/* Interest */}
              <p className="font-mono text-sm tracking-tight text-muted-foreground md:text-right">
                {formatMoney(r.interestCents, currencyCode, undefined, 0)}
              </p>

              {/* Total */}
              <p className="font-mono text-sm font-medium tracking-tight md:text-right">
                {formatMoney(r.totalCents, currencyCode, undefined, 0)}
              </p>

              {/* Status */}
              <div className="flex md:justify-center">
                {r.isPaid ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success-foreground">
                    <Check className="h-3.5 w-3.5" />
                    Paid
                  </span>
                ) : upcoming ? (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      "bg-warning/10 text-warning-foreground",
                    )}
                  >
                    Due
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
