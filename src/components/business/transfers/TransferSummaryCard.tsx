"use client";

import { cn } from "@/lib/utils";
import { formatMoney, currencySymbol } from "@/lib/format";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";
import { useBusinessStore } from "@/providers/business-store";
import { getTransferTypeLabel } from "@/lib/business-utils";

export function TransferSummaryCard() {
  const { activeBusiness } = useBusinessStore();

  const {
    transferType,
    recipientName,
    recipientPhone,
    recipientAccountNumber,
    recipientBankCode,
    amountCents,
    currencyCode,
  } = useBusinessTransferStore();

  const isInternal = transferType === "internal";
  const hasRecipient = isInternal ? !!recipientPhone : !!recipientAccountNumber;
  const hasAmount = amountCents > 0;

  return (
    <div
      className={cn(
        "sticky top-6 divide-y divide-border/40 rounded-2xl",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <div className="px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Transfer Summary
        </p>
      </div>

      {/* Type */}
      <div className="px-5 py-3.5">
        <p className="text-xs text-muted-foreground">Type</p>
        <p className="mt-0.5 text-sm font-medium">
          {getTransferTypeLabel(transferType)}
        </p>
      </div>

      {/* From */}
      <div className="px-5 py-3.5">
        <p className="text-xs text-muted-foreground">From</p>
        <p className="mt-0.5 text-sm font-medium">
          {activeBusiness?.name ?? "Business"}
        </p>
      </div>

      {/* To */}
      <div className={cn("px-5 py-3.5", !hasRecipient && "opacity-40")}>
        <p className="text-xs text-muted-foreground">To</p>
        {hasRecipient ? (
          <>
            <p className="mt-0.5 text-sm font-medium">
              {recipientName || "Resolving..."}
            </p>
            <p className="text-xs text-muted-foreground">
              {isInternal
                ? recipientPhone
                : `${recipientBankCode} - ${recipientAccountNumber}`}
            </p>
          </>
        ) : (
          <p className="mt-0.5 text-sm text-muted-foreground">Not set</p>
        )}
      </div>

      {/* Amount */}
      <div className={cn("px-5 py-3.5", !hasAmount && "opacity-40")}>
        <p className="text-xs text-muted-foreground">Amount</p>
        {hasAmount ? (
          <p className="mt-0.5 font-mono text-sm font-semibold tracking-tight">
            {formatMoney(amountCents, currencyCode, undefined, 0)}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {currencySymbol(currencyCode)} 0
          </p>
        )}
      </div>

      {/* Fee + Total */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div>
          <p className="text-xs text-muted-foreground">Fee</p>
          <p className="mt-0.5 font-mono text-sm font-medium tracking-tight">
            {currencySymbol(currencyCode)} 0
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="mt-0.5 font-mono text-sm font-semibold tracking-tight">
            {hasAmount
              ? formatMoney(amountCents, currencyCode, undefined, 0)
              : `${currencySymbol(currencyCode)} 0`}
          </p>
        </div>
      </div>
    </div>
  );
}
