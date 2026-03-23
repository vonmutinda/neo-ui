"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { CheckCircle2, XCircle } from "lucide-react";
import type { BusinessLoanEligibility } from "@/lib/business-types";

interface LoanEligibilityBannerProps {
  eligibility: BusinessLoanEligibility;
  onViewOffer?: () => void;
}

export function LoanEligibilityBanner({
  eligibility,
  onViewOffer,
}: LoanEligibilityBannerProps) {
  if (!eligibility.eligible) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-card p-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <XCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Not Currently Eligible
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Build your business history to unlock credit facilities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-card p-5 sm:flex-row sm:items-center",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        "ring-1 ring-success/20",
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-5 w-5 text-success-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-success-foreground">
          Pre-approved
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          You qualify for up to{" "}
          <span className="font-semibold text-foreground">
            {formatMoney(
              eligibility.maxAmountCents,
              eligibility.currencyCode,
              undefined,
              0,
            )}
          </span>
          {eligibility.interestRate != null && (
            <> at {eligibility.interestRate}% interest</>
          )}
          {eligibility.maxTermMonths != null && (
            <> for up to {eligibility.maxTermMonths} months</>
          )}
        </p>
      </div>
      {onViewOffer && (
        <button
          onClick={onViewOffer}
          className={cn(
            "h-10 rounded-xl bg-foreground px-5 text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
          )}
        >
          View Offer
        </button>
      )}
    </div>
  );
}
