"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StatementRequest, StatementFormat } from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

interface StatementRequestFormProps {
  onSubmit: (req: StatementRequest) => void;
  isSubmitting: boolean;
}

const CURRENCIES = [
  { value: "", label: "All Currencies" },
  { value: "ETB", label: "ETB" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AED", label: "AED" },
  { value: "SAR", label: "SAR" },
  { value: "CNY", label: "CNY" },
  { value: "KES", label: "KES" },
];

const FORMATS: { value: StatementFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
  { value: "xlsx", label: "Excel" },
];

export function StatementRequestForm({
  onSubmit,
  isSubmitting,
}: StatementRequestFormProps) {
  const [currencyCode, setCurrencyCode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [format, setFormat] = useState<StatementFormat>("pdf");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromDate || !toDate) return;

    onSubmit({
      currencyCode: (currencyCode as SupportedCurrency) || undefined,
      fromDate,
      toDate,
      format,
    });
  }

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <p className="text-sm font-semibold text-foreground">
        Generate Statement
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Currency */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Currency
          </label>
          <select
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className={cn(
              "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
              "focus:ring-2 focus:ring-foreground/20",
            )}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              required
            />
          </div>
        </div>

        {/* Format pills */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Format
          </label>
          <div className="mt-2 flex gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  format === f.value
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !fromDate || !toDate}
          className={cn(
            "h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          {isSubmitting ? "Generating..." : "Generate"}
        </button>
      </form>
    </div>
  );
}
