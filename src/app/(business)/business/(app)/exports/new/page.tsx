"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateExport } from "@/hooks/business/use-exports";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExportsSkeleton } from "@/components/business/exports/ExportsSkeleton";
import { useBusinessPermissionCheck } from "@/hooks/business/use-business-members";
import type { CreateExportRequest, ExportType } from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

const COUNTRIES: { code: string; name: string }[] = [
  { code: "CN", name: "China" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "GB", name: "United Kingdom" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "TR", name: "Turkey" },
  { code: "IT", name: "Italy" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "KE", name: "Kenya" },
  { code: "DJ", name: "Djibouti" },
  { code: "ET", name: "Ethiopia" },
];

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

export default function NewExportPage() {
  const router = useRouter();
  const { activeBusinessId } = useBusinessStore();
  const { isChecking, allowed: canManageExports } = useBusinessPermissionCheck([
    "biz:exports:manage",
  ]);

  const createMutation = useCreateExport(activeBusinessId);

  const [exportType, setExportType] = useState<ExportType>("goods");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCountry, setBuyerCountry] = useState("");
  const [description, setDescription] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [expectedProceedsDate, setExpectedProceedsDate] = useState("");
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountCents = Math.round(parseFloat(amount || "0") * 100);
    if (!buyerName || !buyerCountry || !description || amountCents <= 0) return;

    const data: CreateExportRequest = {
      exportType,
      buyerName,
      buyerCountry,
      description,
      contractAmountCents: amountCents,
      contractCurrency: currency,
    };

    if (hsCode) data.hsCode = hsCode;
    if (expectedProceedsDate) data.expectedProceedsDate = expectedProceedsDate;
    if (notes.trim()) data.notes = notes.trim();

    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Export request created");
        router.push("/business/exports");
      },
      onError: () => toast.error("Failed to create export request"),
    });
  }

  const cardClass = cn(
    "rounded-2xl bg-card p-5",
    "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
  );

  const inputClass = cn(
    "h-11 w-full rounded-xl bg-secondary/60 px-4 text-sm outline-none",
    "placeholder:text-muted-foreground/50",
    "focus:ring-2 focus:ring-foreground/10",
    "transition-shadow",
  );

  const labelClass = "text-xs font-medium text-muted-foreground";

  if (isChecking) {
    return <ExportsSkeleton />;
  }

  if (!canManageExports) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Export" backHref="/business/exports" />
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to create export requests for this
          business.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Export" backHref="/business/exports" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Export type */}
        <div className={cardClass}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Export Type
          </h3>
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            {(["goods", "services"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setExportType(type)}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  exportType === type
                    ? "bg-foreground text-background"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary",
                )}
              >
                {type === "goods" ? "Goods" : "Services"}
              </button>
            ))}
          </div>
        </div>

        {/* Buyer info */}
        <div className={cardClass}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Buyer
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Buyer Name *</label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. ABC Trading Ltd."
                className={cn(inputClass, "mt-1.5")}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Buyer Country *</label>
              <select
                value={buyerCountry}
                onChange={(e) => setBuyerCountry(e.target.value)}
                className={cn(inputClass, "mt-1.5 appearance-none")}
                required
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={cardClass}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {exportType === "goods" ? "Goods" : "Services"}
          </h3>
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  exportType === "goods"
                    ? "Describe the goods being exported..."
                    : "Describe the services being exported..."
                }
                rows={3}
                className={cn(
                  "w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm outline-none",
                  "placeholder:text-muted-foreground/50",
                  "focus:ring-2 focus:ring-foreground/10",
                  "transition-shadow resize-none mt-1.5",
                )}
                required
              />
            </div>
            {exportType === "goods" && (
              <div className="max-w-xs">
                <label className={labelClass}>HS Code</label>
                <input
                  type="text"
                  value={hsCode}
                  onChange={(e) => setHsCode(e.target.value)}
                  placeholder="e.g. 0901.11"
                  className={cn(inputClass, "mt-1.5")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Contract */}
        <div className={cardClass}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Contract
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Contract Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cn(inputClass, "mt-1.5 font-mono")}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Currency *</label>
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as SupportedCurrency)
                }
                className={cn(inputClass, "mt-1.5 appearance-none")}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Expected Proceeds Date</label>
              <input
                type="date"
                value={expectedProceedsDate}
                onChange={(e) => setExpectedProceedsDate(e.target.value)}
                className={cn(inputClass, "mt-1.5")}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={cardClass}>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or instructions..."
            rows={3}
            className={cn(
              "w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm outline-none",
              "placeholder:text-muted-foreground/50",
              "focus:ring-2 focus:ring-foreground/10",
              "transition-shadow resize-none",
            )}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className={cn(
              "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
              "transition-opacity hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            {createMutation.isPending ? "Creating..." : "Create Export"}
          </button>
        </div>
      </form>
    </div>
  );
}
