"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type {
  CreateImportRequest,
  ImportPaymentMethod,
} from "@/lib/business-types";
import type { SupportedCurrency } from "@/lib/types";

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

const PAYMENT_METHODS: { value: ImportPaymentMethod; label: string }[] = [
  { value: "lc", label: "Letter of Credit" },
  { value: "cad", label: "Cash Against Documents" },
  { value: "advance_payment", label: "Advance Payment" },
  { value: "open_account", label: "Open Account" },
];

interface CreateImportFormProps {
  onSubmit: (data: CreateImportRequest) => void;
  isSubmitting: boolean;
}

export function CreateImportForm({
  onSubmit,
  isSubmitting,
}: CreateImportFormProps) {
  const [supplierName, setSupplierName] = useState("");
  const [supplierCountry, setSupplierCountry] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("USD");
  const [paymentMethod, setPaymentMethod] = useState<ImportPaymentMethod>("lc");
  const [insuranceAmount, setInsuranceAmount] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [portOfEntry, setPortOfEntry] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountCents = Math.round(parseFloat(amount || "0") * 100);
    if (
      !supplierName ||
      !supplierCountry ||
      !goodsDescription ||
      amountCents <= 0
    )
      return;

    const data: CreateImportRequest = {
      supplierName,
      supplierCountry,
      goodsDescription,
      proformaAmountCents: amountCents,
      proformaCurrency: currency,
      paymentMethod,
    };

    if (hsCode) data.hsCode = hsCode;
    if (insuranceAmount) {
      data.insuranceAmountCents = Math.round(parseFloat(insuranceAmount) * 100);
    }
    if (insuranceProvider) data.insuranceProvider = insuranceProvider;
    if (portOfEntry) data.portOfEntry = portOfEntry;
    if (expectedArrival) data.expectedArrivalDate = expectedArrival;

    onSubmit(data);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Supplier info */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Supplier
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Supplier Name *</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Shenzhen Electronics Co."
              className={cn(inputClass, "mt-1.5")}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Supplier Country *</label>
            <input
              type="text"
              value={supplierCountry}
              onChange={(e) => setSupplierCountry(e.target.value)}
              placeholder="e.g. China"
              className={cn(inputClass, "mt-1.5")}
              required
            />
          </div>
        </div>
      </div>

      {/* Goods info */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Goods
        </h3>
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>Description of Goods *</label>
            <textarea
              value={goodsDescription}
              onChange={(e) => setGoodsDescription(e.target.value)}
              placeholder="Describe the goods being imported..."
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
          <div className="max-w-xs">
            <label className={labelClass}>HS Code</label>
            <input
              type="text"
              value={hsCode}
              onChange={(e) => setHsCode(e.target.value)}
              placeholder="e.g. 8471.30"
              className={cn(inputClass, "mt-1.5")}
            />
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Payment
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Proforma Amount *</label>
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
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className={cn(inputClass, "mt-1.5 appearance-none")}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Payment Method *</label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPaymentMethod(m.value)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-xs font-medium transition-colors",
                    paymentMethod === m.value
                      ? "bg-foreground text-background"
                      : "bg-secondary/60 text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insurance & logistics */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Insurance & Logistics
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Insurance Amount (ETB)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={insuranceAmount}
              onChange={(e) => setInsuranceAmount(e.target.value)}
              placeholder="0.00"
              className={cn(inputClass, "mt-1.5 font-mono")}
            />
          </div>
          <div>
            <label className={labelClass}>Insurance Provider</label>
            <input
              type="text"
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              placeholder="e.g. Ethiopian Insurance Corp."
              className={cn(inputClass, "mt-1.5")}
            />
          </div>
          <div>
            <label className={labelClass}>Port of Entry</label>
            <input
              type="text"
              value={portOfEntry}
              onChange={(e) => setPortOfEntry(e.target.value)}
              placeholder="e.g. Djibouti"
              className={cn(inputClass, "mt-1.5")}
            />
          </div>
          <div>
            <label className={labelClass}>Expected Arrival</label>
            <input
              type="date"
              value={expectedArrival}
              onChange={(e) => setExpectedArrival(e.target.value)}
              className={cn(inputClass, "mt-1.5")}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          {isSubmitting ? "Creating..." : "Create Import"}
        </button>
      </div>
    </form>
  );
}
