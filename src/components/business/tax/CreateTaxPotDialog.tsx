// DEPRECATED: Tax pots are now part of the general Pots system.
// Use components/business/pots/CreatePotDialog.tsx instead.
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TAX_TYPE_OPTIONS } from "@/lib/business-utils";
import type { CreateBusinessPotRequest, TaxType } from "@/lib/business-types";

interface CreateTaxPotDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateBusinessPotRequest) => void;
  isSubmitting: boolean;
}

export function CreateTaxPotDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateTaxPotDialogProps) {
  const [name, setName] = useState("");
  const [taxType, setTaxType] = useState<TaxType>("vat");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    onSubmit({
      name,
      currencyCode: "ETB",
      category: "tax",
      taxType,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
        role="dialog"
        aria-modal="true"
      >
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
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="e.g. VAT Reserve"
              required
            />
          </div>

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
