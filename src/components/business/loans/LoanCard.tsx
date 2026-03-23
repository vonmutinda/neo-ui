"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getLoanStatusColor, getLoanStatusLabel } from "@/lib/business-utils";
import type { BusinessLoan } from "@/lib/business-types";

interface LoanCardProps {
  loan: BusinessLoan;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LoanCard({ loan }: LoanCardProps) {
  const paidInstallments =
    loan.installments?.filter((r) => r.isPaid).length ?? 0;
  const totalInstallments = loan.installments?.length ?? 0;
  const progressPct =
    totalInstallments > 0
      ? Math.round((paidInstallments / totalInstallments) * 100)
      : loan.totalDueCents > 0
        ? Math.round((loan.totalPaidCents / loan.totalDueCents) * 100)
        : 0;

  const outstandingCents = loan.totalDueCents - loan.totalPaidCents;

  const metrics = [
    {
      label: "Principal",
      value: formatMoney(loan.principalAmountCents, "ETB", undefined, 0),
      accent: "",
    },
    {
      label: "Outstanding",
      value: formatMoney(outstandingCents, "ETB", undefined, 0),
      accent: outstandingCents > 0 ? "text-warning-foreground" : "",
    },
    {
      label: "Interest Fee",
      value: formatMoney(loan.interestFeeCents, "ETB", undefined, 0),
      accent: "",
    },
    {
      label: "Duration",
      value: `${loan.durationDays} days`,
      accent: "",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        "transition-all hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Business Loan</p>
          {loan.disbursedAt && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Disbursed {formatDate(loan.disbursedAt)}
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
            getLoanStatusColor(loan.status),
          )}
        >
          {getLoanStatusLabel(loan.status)}
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {m.label}
            </p>
            <p
              className={cn(
                "mt-0.5 font-mono text-sm font-semibold tracking-tight",
                m.accent,
              )}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {paidInstallments} of {totalInstallments} installments paid
          </span>
          <span className="font-mono">{progressPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progressPct === 100 ? "bg-success-foreground" : "bg-foreground",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {loan.dueDate && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            Due: {formatDate(loan.dueDate)}
          </p>
        )}
      </div>
    </div>
  );
}
