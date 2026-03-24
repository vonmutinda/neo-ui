"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createImportSchema } from "@/lib/schemas";
import { useFormErrors } from "@/hooks/use-form-errors";
import { FormField } from "@/components/ui/form-field";
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

interface CreateImportFormProps {
  onSubmit: (data: CreateImportRequest) => void;
  isSubmitting: boolean;
  /** Pre-fill for edit mode */
  initialData?: Partial<CreateImportRequest>;
  /** Button label override */
  submitLabel?: string;
  onCancel?: () => void;
}

export function CreateImportForm({
  onSubmit,
  isSubmitting,
  initialData,
  submitLabel,
  onCancel,
}: CreateImportFormProps) {
  const [supplierName, setSupplierName] = useState(
    initialData?.supplierName ?? "",
  );
  const [supplierCountry, setSupplierCountry] = useState(
    initialData?.supplierCountry ?? "",
  );
  const [goodsDescription, setGoodsDescription] = useState(
    initialData?.goodsDescription ?? "",
  );
  const [hsCode, setHsCode] = useState(initialData?.hsCode ?? "");
  const [amount, setAmount] = useState(
    initialData?.proformaAmountCents
      ? String(initialData.proformaAmountCents / 100)
      : "",
  );
  const [currency, setCurrency] = useState<SupportedCurrency>(
    initialData?.proformaCurrency ?? "USD",
  );
  const [paymentMethod, setPaymentMethod] = useState<ImportPaymentMethod>(
    initialData?.paymentMethod ?? "lc",
  );
  const [insuranceAmount, setInsuranceAmount] = useState(
    initialData?.insuranceAmountCents
      ? String(initialData.insuranceAmountCents / 100)
      : "",
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    initialData?.insuranceProvider ?? "",
  );
  const [portOfEntry, setPortOfEntry] = useState(
    initialData?.portOfEntry ?? "",
  );
  const [expectedArrival, setExpectedArrival] = useState(
    initialData?.expectedArrivalDate ?? "",
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const formData = {
    supplierName,
    supplierCountry,
    goodsDescription,
    hsCode: hsCode || "",
    proformaAmountCents: Math.round(parseFloat(amount || "0") * 100),
    proformaCurrency: currency,
    paymentMethod,
    insuranceAmountCents: insuranceAmount
      ? Math.round(parseFloat(insuranceAmount) * 100)
      : undefined,
    insuranceProvider: insuranceProvider || undefined,
    portOfEntry: portOfEntry || undefined,
    expectedArrivalDate: expectedArrival || undefined,
    notes: notes.trim() || undefined,
  };

  const { errors, validate, clearField } = useFormErrors(
    createImportSchema,
    formData,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const amountCents = Math.round(parseFloat(amount || "0") * 100);

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
    if (notes.trim()) data.notes = notes.trim();

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
          <FormField label="Supplier Name *" error={errors.supplierName}>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => {
                setSupplierName(e.target.value);
                clearField("supplierName");
              }}
              placeholder="e.g. Shenzhen Electronics Co."
              className={cn(inputClass)}
            />
          </FormField>
          <FormField label="Supplier Country *" error={errors.supplierCountry}>
            <select
              value={supplierCountry}
              onChange={(e) => {
                setSupplierCountry(e.target.value);
                clearField("supplierCountry");
              }}
              className={cn(inputClass, "appearance-none")}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Goods info */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Goods
        </h3>
        <div className="grid gap-4">
          <FormField
            label="Description of Goods *"
            error={errors.goodsDescription}
          >
            <textarea
              value={goodsDescription}
              onChange={(e) => {
                setGoodsDescription(e.target.value);
                clearField("goodsDescription");
              }}
              placeholder="Describe the goods being imported..."
              rows={3}
              className={cn(
                "w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm outline-none",
                "placeholder:text-muted-foreground/50",
                "focus:ring-2 focus:ring-foreground/10",
                "transition-shadow resize-none",
              )}
            />
          </FormField>
          <FormField label="HS Code" error={errors.hsCode} className="max-w-xs">
            <input
              type="text"
              value={hsCode}
              onChange={(e) => {
                setHsCode(e.target.value);
                clearField("hsCode");
              }}
              placeholder="e.g. 8471.30"
              className={cn(inputClass)}
            />
          </FormField>
        </div>
      </div>

      {/* Payment info */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Payment
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Proforma Amount *"
            error={errors.proformaAmountCents}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clearField("proformaAmountCents");
              }}
              placeholder="0.00"
              className={cn(inputClass, "font-mono")}
            />
          </FormField>
          <FormField label="Currency *" error={errors.proformaCurrency}>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value as SupportedCurrency);
                clearField("proformaCurrency");
              }}
              className={cn(inputClass, "appearance-none")}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
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
          <FormField
            label="Insurance Amount (ETB)"
            error={errors.insuranceAmountCents}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={insuranceAmount}
              onChange={(e) => {
                setInsuranceAmount(e.target.value);
                clearField("insuranceAmountCents");
              }}
              placeholder="0.00"
              className={cn(inputClass, "font-mono")}
            />
          </FormField>
          <FormField
            label="Insurance Provider"
            error={errors.insuranceProvider}
          >
            <input
              type="text"
              value={insuranceProvider}
              onChange={(e) => {
                setInsuranceProvider(e.target.value);
                clearField("insuranceProvider");
              }}
              placeholder="e.g. Ethiopian Insurance Corp."
              className={cn(inputClass)}
            />
          </FormField>
          <FormField label="Port of Entry" error={errors.portOfEntry}>
            <input
              type="text"
              value={portOfEntry}
              onChange={(e) => {
                setPortOfEntry(e.target.value);
                clearField("portOfEntry");
              }}
              placeholder="e.g. Djibouti"
              className={cn(inputClass)}
            />
          </FormField>
          <FormField
            label="Expected Arrival"
            error={errors.expectedArrivalDate}
          >
            <input
              type="date"
              value={expectedArrival}
              onChange={(e) => {
                setExpectedArrival(e.target.value);
                clearField("expectedArrivalDate");
              }}
              className={cn(inputClass)}
            />
          </FormField>
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
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "h-11 rounded-xl bg-secondary px-6 text-sm font-medium text-muted-foreground",
              "transition-colors hover:bg-secondary/80",
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          {isSubmitting ? "Saving..." : (submitLabel ?? "Create Import")}
        </button>
      </div>
    </form>
  );
}
