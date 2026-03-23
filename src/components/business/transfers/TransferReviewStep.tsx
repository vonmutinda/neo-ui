"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatMoney, currencySymbol } from "@/lib/format";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";
import { useBusinessStore } from "@/providers/business-store";
import { useInitiateTransfer } from "@/hooks/business/use-initiate-transfer";
import {
  getTransferTypeLabel,
  PURPOSE_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/lib/business-utils";

export function TransferReviewStep() {
  const router = useRouter();
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const initiateMutation = useInitiateTransfer(activeBusinessId);

  const {
    transferType,
    recipientPhone,
    recipientName,
    recipientAccountNumber,
    recipientBankCode,
    amountCents,
    currencyCode,
    narration,
    purpose,
    category,
    setStep,
    reset,
  } = useBusinessTransferStore();

  const isInternal = transferType === "internal";
  const purposeLabel = PURPOSE_OPTIONS.find((o) => o.value === purpose)?.label;
  const categoryLabel = CATEGORY_OPTIONS.find(
    (o) => o.value === category,
  )?.label;

  function handleConfirm() {
    initiateMutation.mutate(
      {
        transferType,
        recipientPhone: isInternal ? recipientPhone : undefined,
        recipientAccountNumber: !isInternal
          ? recipientAccountNumber
          : undefined,
        recipientBankCode: !isInternal ? recipientBankCode : undefined,
        recipientName: recipientName || undefined,
        amountCents,
        currencyCode,
        narration: narration || undefined,
        purpose: purpose || undefined,
        category: category || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Transfer initiated successfully");
          reset();
          router.push("/business/transfers");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to initiate transfer");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Review transfer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm the details before sending
        </p>
      </div>

      {/* Summary card */}
      <div
        className={cn(
          "divide-y divide-border/40 rounded-2xl",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* From */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground">From</p>
          <p className="mt-0.5 text-sm font-semibold">
            {activeBusiness?.name ?? "Business"}{" "}
            <span className="font-normal text-muted-foreground">
              ({currencyCode})
            </span>
          </p>
        </div>

        {/* To */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground">To</p>
          <p className="mt-0.5 text-sm font-semibold">
            {recipientName || "Recipient"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isInternal
              ? recipientPhone
              : `${recipientBankCode} - ${recipientAccountNumber}`}
          </p>
        </div>

        {/* Amount */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight">
            {formatMoney(amountCents, currencyCode, undefined, 0)}
          </p>
        </div>

        {/* Fee + Total */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs text-muted-foreground">Fee</p>
            <p className="mt-0.5 font-mono text-sm font-medium tracking-tight">
              {currencySymbol(currencyCode)} 0
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-0.5 font-mono text-sm font-semibold tracking-tight">
              {formatMoney(amountCents, currencyCode, undefined, 0)}
            </p>
          </div>
        </div>

        {/* Optional details */}
        {(narration || purposeLabel || categoryLabel) && (
          <div className="space-y-2 px-5 py-4">
            {narration && (
              <div>
                <p className="text-xs text-muted-foreground">Narration</p>
                <p className="mt-0.5 text-sm">{narration}</p>
              </div>
            )}
            {purposeLabel && (
              <div>
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="mt-0.5 text-sm">{purposeLabel}</p>
              </div>
            )}
            {categoryLabel && (
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="mt-0.5 text-sm">{categoryLabel}</p>
              </div>
            )}
          </div>
        )}

        {/* Type badge */}
        <div className="px-5 py-4">
          <p className="text-xs text-muted-foreground">Type</p>
          <p className="mt-0.5 text-sm font-medium">
            {getTransferTypeLabel(transferType)}
          </p>
        </div>
      </div>

      {/* Approval warning */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl bg-warning/10 px-5 py-4",
        )}
      >
        <AlertTriangle className="h-5 w-5 shrink-0 text-warning-foreground" />
        <p className="text-sm text-warning-foreground">
          This transfer may require approval from an authorized member before it
          is executed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setStep(3)}
          disabled={initiateMutation.isPending}
          className={cn(
            "flex h-12 items-center gap-2 rounded-xl border border-input px-5 text-sm font-medium",
            "transition-colors hover:bg-secondary/60 active:bg-secondary",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={handleConfirm}
          disabled={initiateMutation.isPending}
          className={cn(
            "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-60 disabled:pointer-events-none",
          )}
        >
          {initiateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {initiateMutation.isPending ? "Initiating..." : "Confirm & Send"}
        </button>
      </div>
    </div>
  );
}
