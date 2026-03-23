"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { CreateBatchPaymentRequest } from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

interface CreateBatchFormProps {
  onSubmit: (data: CreateBatchPaymentRequest) => void;
  isSubmitting: boolean;
}

interface RecipientRow {
  key: string;
  recipientName: string;
  recipientPhone: string;
  recipientBank: string;
  recipientAccount: string;
  amountCents: string;
  narration: string;
}

const CURRENCIES: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

function emptyRow(): RecipientRow {
  return {
    key: crypto.randomUUID(),
    recipientName: "",
    recipientPhone: "",
    recipientBank: "",
    recipientAccount: "",
    amountCents: "",
    narration: "",
  };
}

export function CreateBatchForm({
  onSubmit,
  isSubmitting,
}: CreateBatchFormProps) {
  const [name, setName] = useState("");
  const [currencyCode, setCurrencyCode] = useState<SupportedCurrency>("ETB");
  const [rows, setRows] = useState<RecipientRow[]>([emptyRow()]);

  const updateRow = useCallback(
    (key: string, field: keyof RecipientRow, value: string) => {
      setRows((prev) =>
        prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  const removeRow = useCallback((key: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.key !== key);
    });
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const summary = useMemo(() => {
    const validRows = rows.filter(
      (r) => r.recipientName.trim() && r.amountCents,
    );
    const totalCents = validRows.reduce(
      (sum, r) => sum + Math.round(parseFloat(r.amountCents || "0") * 100),
      0,
    );
    return { count: validRows.length, totalCents };
  }, [rows]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const items = rows
      .filter((r) => r.recipientName.trim() && r.amountCents)
      .map((r) => ({
        recipientName: r.recipientName.trim(),
        recipientPhone: r.recipientPhone.trim() || undefined,
        recipientBank: r.recipientBank.trim() || undefined,
        recipientAccount: r.recipientAccount.trim() || undefined,
        amountCents: Math.round(parseFloat(r.amountCents) * 100),
        narration: r.narration.trim() || undefined,
      }));

    if (!name.trim() || items.length === 0) return;

    onSubmit({
      name: name.trim(),
      currencyCode,
      items,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Batch info */}
      <div
        className={cn(
          "rounded-2xl p-5 space-y-4",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Batch Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. March Payroll"
              required
              className={cn(
                "flex h-11 w-full rounded-xl bg-muted/50 px-4 text-sm",
                "outline-none transition-colors",
                "placeholder:text-muted-foreground/50",
                "focus:ring-2 focus:ring-foreground/10",
              )}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Currency
            </label>
            <select
              value={currencyCode}
              onChange={(e) =>
                setCurrencyCode(e.target.value as SupportedCurrency)
              }
              className={cn(
                "flex h-11 w-full rounded-xl bg-muted/50 px-4 text-sm",
                "outline-none transition-colors",
                "focus:ring-2 focus:ring-foreground/10",
              )}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recipients */}
      <div
        className={cn(
          "rounded-2xl p-5 space-y-4",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <p className="text-sm font-medium">Recipients</p>

        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div
              key={row.key}
              className="grid gap-3 rounded-xl bg-muted/30 p-4 sm:grid-cols-[1fr_1fr_1fr_0.8fr_1fr_auto]"
            >
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Name *
                </label>
                <input
                  type="text"
                  value={row.recipientName}
                  onChange={(e) =>
                    updateRow(row.key, "recipientName", e.target.value)
                  }
                  placeholder="Full name"
                  required
                  className={cn(
                    "flex h-10 w-full rounded-lg bg-background px-3 text-sm",
                    "outline-none placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-foreground/10",
                  )}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Phone
                </label>
                <input
                  type="text"
                  value={row.recipientPhone}
                  onChange={(e) =>
                    updateRow(row.key, "recipientPhone", e.target.value)
                  }
                  placeholder="+251..."
                  className={cn(
                    "flex h-10 w-full rounded-lg bg-background px-3 text-sm",
                    "outline-none placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-foreground/10",
                  )}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Bank
                </label>
                <input
                  type="text"
                  value={row.recipientBank}
                  onChange={(e) =>
                    updateRow(row.key, "recipientBank", e.target.value)
                  }
                  placeholder="Bank name"
                  className={cn(
                    "flex h-10 w-full rounded-lg bg-background px-3 text-sm",
                    "outline-none placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-foreground/10",
                  )}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Account
                </label>
                <input
                  type="text"
                  value={row.recipientAccount}
                  onChange={(e) =>
                    updateRow(row.key, "recipientAccount", e.target.value)
                  }
                  placeholder="Acct #"
                  className={cn(
                    "flex h-10 w-full rounded-lg bg-background px-3 text-sm",
                    "outline-none placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-foreground/10",
                  )}
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Amount *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={row.amountCents}
                  onChange={(e) =>
                    updateRow(row.key, "amountCents", e.target.value)
                  }
                  placeholder="0.00"
                  required
                  className={cn(
                    "flex h-10 w-full rounded-lg bg-background px-3 text-sm font-mono",
                    "outline-none placeholder:text-muted-foreground/50",
                    "focus:ring-2 focus:ring-foreground/10",
                  )}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeRow(row.key)}
                  disabled={rows.length <= 1}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground",
                    "transition-colors hover:bg-destructive/10 hover:text-destructive",
                    "disabled:opacity-30 disabled:pointer-events-none",
                  )}
                  aria-label={`Remove recipient ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className={cn(
            "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium",
            "bg-muted text-muted-foreground",
            "transition-colors hover:bg-muted/80",
          )}
        >
          <Plus className="h-4 w-4" />
          Add Recipient
        </button>
      </div>

      {/* Summary + actions */}
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{summary.count}</span>{" "}
          recipients &middot;{" "}
          <span className="font-mono font-medium text-foreground">
            {formatMoney(summary.totalCents, currencyCode, undefined, 0)}
          </span>{" "}
          total
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className={cn(
              "h-10 rounded-xl border border-input px-5 text-sm font-medium",
              "transition-colors hover:bg-secondary/60",
            )}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || summary.count === 0}
            className={cn(
              "h-10 rounded-xl bg-foreground px-5 text-sm font-medium text-background",
              "transition-opacity hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Batch"}
          </button>
        </div>
      </div>
    </form>
  );
}
