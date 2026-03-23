"use client";

import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { currencySymbol, formatMoney } from "@/lib/format";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";
import { useBusinessBalances } from "@/hooks/business/use-business-wallets";
import { useBusinessStore } from "@/providers/business-store";
import { PURPOSE_OPTIONS, CATEGORY_OPTIONS } from "@/lib/business-utils";
import type { SupportedCurrency } from "@/lib/types";

export function TransferAmountStep() {
  const { activeBusinessId } = useBusinessStore();
  const { data: balances } = useBusinessBalances(activeBusinessId);

  const {
    amountCents,
    setAmountCents,
    currencyCode,
    setCurrencyCode,
    narration,
    setNarration,
    purpose,
    setPurpose,
    category,
    setCategory,
    setStep,
  } = useBusinessTransferStore();

  const displayAmount = amountCents > 0 ? (amountCents / 100).toString() : "";

  function handleAmountChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const integral = parts[0] || "0";
    const decimal = parts.length > 1 ? parts[1].slice(0, 2) : undefined;
    const numStr = decimal !== undefined ? `${integral}.${decimal}` : integral;
    const cents = Math.round(parseFloat(numStr || "0") * 100);
    setAmountCents(cents);
  }

  const selectedBalance = balances?.find(
    (b) => b.currencyCode === currencyCode,
  );

  const canContinue = amountCents > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Enter amount</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How much do you want to send?
        </p>
      </div>

      {/* Hero amount input */}
      <div className="flex flex-col items-center gap-3 py-6">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-medium text-muted-foreground">
            {currencySymbol(currencyCode)}
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={displayAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full max-w-[240px] bg-transparent text-center font-mono text-5xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Available balance */}
        {selectedBalance && (
          <p className="text-sm text-muted-foreground">
            Available:{" "}
            <span className="font-medium">
              {formatMoney(
                selectedBalance.balanceCents,
                currencyCode,
                undefined,
                0,
              )}
            </span>
          </p>
        )}
      </div>

      {/* Currency selector pills */}
      {balances && balances.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {balances.map((b) => (
            <button
              key={b.currencyCode}
              onClick={() =>
                setCurrencyCode(b.currencyCode as SupportedCurrency)
              }
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                currencyCode === b.currencyCode
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {b.currencyCode}
            </button>
          ))}
        </div>
      )}

      {/* Fee strip */}
      <div
        className={cn(
          "flex items-center justify-between rounded-2xl px-5 py-4",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <span className="text-sm text-muted-foreground">Fee</span>
        <span className="font-mono text-sm font-medium tracking-tight">
          {currencySymbol(currencyCode)} 0
        </span>
      </div>

      {/* Narration */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
          Narration (optional)
        </label>
        <textarea
          placeholder="What is this transfer for?"
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          rows={2}
          className={cn(
            "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none resize-none",
            "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
            "transition-[color,box-shadow] placeholder:text-muted-foreground",
          )}
        />
      </div>

      {/* Purpose and Category */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Purpose (optional)
          </label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className={cn(
              "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
              "transition-[color,box-shadow]",
            )}
          >
            <option value="">Select purpose</option>
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
            Category (optional)
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={cn(
              "h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
              "transition-[color,box-shadow]",
            )}
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setStep(2)}
          className={cn(
            "flex h-12 items-center gap-2 rounded-xl border border-input px-5 text-sm font-medium",
            "transition-colors hover:bg-secondary/60 active:bg-secondary",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => setStep(4)}
          disabled={!canContinue}
          className={cn(
            "flex h-12 flex-1 items-center justify-center rounded-xl bg-foreground text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Review
        </button>
      </div>
    </div>
  );
}
