"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { TAX_TYPE_OPTIONS } from "@/lib/business-utils";
import type {
  CreateBusinessPotRequest,
  PotCategory,
  TaxType,
} from "@/lib/business-types";

const CATEGORY_OPTIONS: { value: PotCategory; label: string }[] = [
  { value: "general", label: "General" },
  { value: "tax", label: "Tax" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "savings", label: "Savings" },
  { value: "event", label: "Event" },
  { value: "reserve", label: "Reserve" },
];

const EMOJI_PRESETS = ["💰", "🏦", "📊", "🎯", "☕", "🏗️", "🚀", "💼"];

interface CreatePotDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateBusinessPotRequest) => void;
  isSubmitting: boolean;
  defaultCurrency?: string;
}

export function CreatePotDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  defaultCurrency = "ETB",
}: CreatePotDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<PotCategory>("general");
  const [emoji, setEmoji] = useState("💰");
  const [targetCents, setTargetCents] = useState("");
  const [taxType, setTaxType] = useState<TaxType>("vat");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const isTax = category === "tax";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const target = targetCents
      ? Math.round(parseFloat(targetCents) * 100)
      : undefined;

    onSubmit({
      name: name.trim(),
      currencyCode: defaultCurrency,
      category,
      emoji,
      targetCents: target,
      ...(isTax && {
        taxType,
        dueDate: dueDate || undefined,
        notes: notes.trim() || undefined,
      }),
    });
  }

  function handleClose() {
    setName("");
    setCategory("general");
    setEmoji("💰");
    setTargetCents("");
    setTaxType("vat");
    setDueDate("");
    setNotes("");
    onClose();
  }

  const inputClass = cn(
    "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
    "focus:ring-2 focus:ring-foreground/20",
  );
  const labelClass =
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
          "max-h-[90vh] overflow-y-auto",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-pot-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="create-pot-title"
            className="text-base font-semibold text-foreground"
          >
            New Pot
          </h2>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Emoji picker */}
          <div>
            <label className={labelClass}>Icon</label>
            <div className="mt-1.5 flex gap-1.5 flex-wrap">
              {EMOJI_PRESETS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all",
                    emoji === e
                      ? "bg-foreground/10 ring-2 ring-foreground/30 scale-110"
                      : "hover:bg-muted",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. VAT Reserve, Team Lunch, Petty Cash"
              required
              maxLength={50}
            />
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PotCategory)}
              className={inputClass}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target amount */}
          <div>
            <label className={labelClass}>
              Target Amount ({defaultCurrency})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetCents}
              onChange={(e) => setTargetCents(e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </div>

          {/* Tax-specific fields */}
          {isTax && (
            <>
              <div>
                <label className={labelClass}>Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value as TaxType)}
                  className={inputClass}
                >
                  {TAX_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Q2 2026 filing"
                />
              </div>
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background",
              "transition-opacity hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Pot"}
          </button>
        </form>
      </div>
    </div>
  );
}
