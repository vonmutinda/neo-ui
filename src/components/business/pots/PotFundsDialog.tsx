"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { formatMoney } from "@/lib/format";
import type { BusinessPot } from "@/lib/business-types";

interface PotFundsDialogProps {
  open: boolean;
  mode: "add" | "withdraw";
  pot: BusinessPot | null;
  onClose: () => void;
  onSubmit: (amountCents: number) => void;
  isSubmitting: boolean;
}

export function PotFundsDialog({
  open,
  mode,
  pot,
  onClose,
  onSubmit,
  isSubmitting,
}: PotFundsDialogProps) {
  const [amount, setAmount] = useState("");

  if (!open || !pot) return null;

  const isAdd = mode === "add";
  const title = isAdd ? "Add Funds" : "Withdraw Funds";
  const Icon = isAdd ? ArrowUpToLine : ArrowDownToLine;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    onSubmit(Math.round(parsed * 100));
  }

  function handleClose() {
    setAmount("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-sm rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pot info */}
        <div className="mt-4 rounded-xl bg-secondary p-3">
          <p className="text-sm font-medium">
            {pot.emoji && `${pot.emoji} `}
            {pot.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Balance: {formatMoney(pot.balanceCents, pot.currencyCode)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Amount ({pot.currencyCode})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "mt-1 h-12 w-full rounded-xl bg-secondary px-3 text-lg font-mono font-semibold outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="0.00"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className={cn(
              "h-10 w-full rounded-xl text-sm font-medium transition-opacity",
              "hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
              isAdd
                ? "bg-foreground text-background"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {isSubmitting
              ? "Processing..."
              : isAdd
                ? "Add Funds"
                : "Withdraw Funds"}
          </button>
        </form>
      </div>
    </div>
  );
}
