"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TAX_TYPE_OPTIONS } from "@/lib/business-utils";
import type { CreateTaxPotRequest, TaxType } from "@/lib/business-types";

interface CreateTaxPotDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateTaxPotRequest) => void;
  isSubmitting: boolean;
}

export function CreateTaxPotDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTaxPotDialogProps) {
  const [taxType, setTaxType] = useState<TaxType>("vat");
  const [autoSweepPercent, setAutoSweepPercent] = useState("15");
  const [targetAmount, setTargetAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pct = parseFloat(autoSweepPercent);
    if (isNaN(pct) || pct < 0 || pct > 100) return;

    const targetCents = targetAmount
      ? Math.round(parseFloat(targetAmount) * 100)
      : undefined;

    onSubmit({
      taxType,
      autoSweepPercent: pct,
      targetCents: targetCents && targetCents > 0 ? targetCents : undefined,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            New Tax Pot
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tax type */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Tax Type
            </label>
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as TaxType)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
            >
              {TAX_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-sweep % */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Auto-sweep %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={autoSweepPercent}
              onChange={(e) => setAutoSweepPercent(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="15"
              required
            />
          </div>

          {/* Target amount */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Target Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="Optional"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="Optional notes"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background",
              "transition-opacity hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Tax Pot"}
          </button>
        </form>
      </div>
    </div>
  );
}
