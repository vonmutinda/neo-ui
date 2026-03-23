"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useBusinessStore } from "@/providers/business-store";
import {
  useLoanEligibility,
  useBusinessLoans,
} from "@/hooks/business/use-business-loans";
import { formatMoney } from "@/lib/format";
import { getLoanStatusColor, getLoanStatusLabel } from "@/lib/business-utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoanEligibilityBanner } from "@/components/business/loans/LoanEligibilityBanner";
import { LoanCard } from "@/components/business/loans/LoanCard";
import { RepaymentScheduleTable } from "@/components/business/loans/RepaymentScheduleTable";
import { LoansSkeleton } from "@/components/business/loans/LoansSkeleton";
import type { BusinessLoanStatus } from "@/lib/business-types";
import { useMyPermissions } from "@/hooks/business/use-business-members";

type Tab = "active" | "history" | "eligibility";

const TABS: { value: Tab; label: string }[] = [
  { value: "active", label: "Active Loan" },
  { value: "history", label: "History" },
  { value: "eligibility", label: "Eligibility" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const HISTORY_STATUSES: BusinessLoanStatus[] = [
  "repaid",
  "written_off",
  "defaulted",
];

export default function LoansPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);
  const canApplyLoan = permissions?.includes("biz:loans:apply") ?? false;
  const [activeTab, setActiveTab] = useState<Tab>("active");

  const { data: eligibility, isLoading: eligLoading } =
    useLoanEligibility(activeBusinessId);

  const activeFilter = useMemo(
    () => ({ status: "active" as BusinessLoanStatus, limit: 10 }),
    [],
  );
  const { data: activeResult, isLoading: activeLoading } = useBusinessLoans(
    activeBusinessId,
    activeFilter,
  );

  const { data: allResult } = useBusinessLoans(activeBusinessId, { limit: 50 });

  const isLoading = eligLoading || activeLoading;

  if (isLoading) return <LoansSkeleton />;

  const activeLoans = activeResult?.data ?? [];
  const allLoans = allResult?.data ?? [];
  const historyLoans = allLoans.filter((l) =>
    HISTORY_STATUSES.includes(l.status),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Loans" />

      {/* Eligibility banner */}
      {eligibility && (
        <LoanEligibilityBanner
          eligibility={eligibility}
          onViewOffer={
            eligibility.eligible && canApplyLoan
              ? () => setActiveTab("eligibility")
              : undefined
          }
        />
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active tab */}
      {activeTab === "active" && (
        <div className="space-y-6">
          {activeLoans.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No active loans
            </div>
          ) : (
            activeLoans.map((loan) => (
              <div key={loan.id} className="space-y-4">
                <LoanCard loan={loan} />
                {loan.installments && loan.installments.length > 0 && (
                  <RepaymentScheduleTable
                    schedule={loan.installments}
                    currencyCode="ETB"
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {activeTab === "history" && (
        <div
          className={cn(
            "overflow-hidden rounded-2xl",
            "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          )}
        >
          {historyLoans.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No loan history
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {historyLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {formatMoney(
                        loan.principalAmountCents,
                        "ETB",
                        undefined,
                        0,
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {loan.durationDays} days &middot;{" "}
                      {formatDate(loan.createdAt)}
                    </p>
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Eligibility tab */}
      {activeTab === "eligibility" && eligibility && (
        <div
          className={cn(
            "rounded-2xl bg-card p-6",
            "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          )}
        >
          <h3 className="text-sm font-semibold text-foreground">
            Loan Eligibility Details
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Status
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  eligibility.eligible
                    ? "text-success-foreground"
                    : "text-muted-foreground",
                )}
              >
                {eligibility.eligible ? "Eligible" : "Not Eligible"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Max Amount
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tracking-tight">
                {formatMoney(
                  eligibility.maxAmountCents,
                  eligibility.currencyCode,
                  undefined,
                  0,
                )}
              </p>
            </div>
            {eligibility.interestRate != null && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Interest Rate
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {eligibility.interestRate}%
                </p>
              </div>
            )}
            {eligibility.maxTermMonths != null && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Max Term
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {eligibility.maxTermMonths} months
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
