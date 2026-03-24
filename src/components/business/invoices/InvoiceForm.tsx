"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { createInvoiceSchema } from "@/lib/schemas";
import { useFormErrors } from "@/hooks/use-form-errors";
import { FormField } from "@/components/ui/form-field";
import type { Invoice, CreateInvoiceRequest } from "@/lib/business-types";
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

interface LineItemDraft {
  key: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface InvoiceFormState {
  customerName: string;
  customerEmail: string;
  currencyCode: SupportedCurrency;
  lineItems: {
    description: string;
    quantity: number;
    unitPriceCents: number;
  }[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  issueDate: string;
  dueDate: string;
  notes: string;
}

interface InvoiceFormProps {
  onSaveDraft: (data: CreateInvoiceRequest) => void;
  onSend: (data: CreateInvoiceRequest) => void;
  isSubmitting: boolean;
  initialData?: Invoice;
  onChange?: (state: InvoiceFormState) => void;
}

function newLineItem(): LineItemDraft {
  return {
    key: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPriceCents: 0,
  };
}

function toDateInputValue(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export function InvoiceForm({
  onSaveDraft,
  onSend,
  isSubmitting,
  initialData,
  onChange,
}: InvoiceFormProps) {
  const [customerName, setCustomerName] = useState(
    initialData?.customerName ?? "",
  );
  const [customerEmail, setCustomerEmail] = useState(
    initialData?.customerEmail ?? "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.customerPhone ?? "",
  );
  const [currencyCode, setCurrencyCode] = useState<SupportedCurrency>(
    (initialData?.currencyCode as SupportedCurrency) ?? "ETB",
  );
  const [issueDate, setIssueDate] = useState(
    toDateInputValue(initialData?.issueDate),
  );
  const [dueDate, setDueDate] = useState(
    toDateInputValue(initialData?.dueDate),
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [taxPercent, setTaxPercent] = useState(() => {
    if (initialData && initialData.subtotalCents > 0) {
      return Math.round(
        (initialData.taxCents / initialData.subtotalCents) * 100,
      );
    }
    return 0;
  });

  const [lineItems, setLineItems] = useState<LineItemDraft[]>(() => {
    if (initialData?.lineItems?.length) {
      return initialData.lineItems.map((li) => ({
        key: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
      }));
    }
    return [newLineItem()];
  });

  const subtotalCents = useMemo(
    () =>
      lineItems.reduce((sum, li) => sum + li.quantity * li.unitPriceCents, 0),
    [lineItems],
  );
  const taxCents = useMemo(
    () => Math.round(subtotalCents * (taxPercent / 100)),
    [subtotalCents, taxPercent],
  );
  const totalCents = subtotalCents + taxCents;

  const schemaData = {
    customerName: customerName.trim(),
    customerEmail: customerEmail.trim(),
    customerPhone: customerPhone.trim() || undefined,
    currencyCode,
    subtotalCents,
    taxCents,
    totalCents,
    issueDate,
    dueDate,
    notes: notes.trim() || undefined,
    lineItems: lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unitPriceCents: li.unitPriceCents,
    })),
  };

  const { errors, validate, clearField } = useFormErrors(
    createInvoiceSchema,
    schemaData,
  );

  // Sync form state to parent for live preview
  useEffect(() => {
    onChange?.({
      customerName,
      customerEmail,
      currencyCode,
      lineItems: lineItems.map((li) => ({
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
      })),
      subtotalCents,
      taxCents,
      totalCents,
      issueDate,
      dueDate,
      notes,
    });
  }, [
    customerName,
    customerEmail,
    currencyCode,
    lineItems,
    subtotalCents,
    taxCents,
    totalCents,
    issueDate,
    dueDate,
    notes,
    onChange,
  ]);

  const updateLineItem = useCallback(
    (key: string, field: keyof LineItemDraft, value: string | number) => {
      setLineItems((prev) =>
        prev.map((li) => (li.key === key ? { ...li, [field]: value } : li)),
      );
    },
    [],
  );

  const removeLineItem = useCallback((key: string) => {
    setLineItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((li) => li.key !== key);
    });
  }, []);

  function buildRequest(): CreateInvoiceRequest {
    return {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      currencyCode,
      subtotalCents,
      taxCents,
      totalCents,
      issueDate,
      dueDate,
      notes: notes.trim() || undefined,
      lineItems: lineItems.map((li, i) => ({
        description: li.description,
        quantity: li.quantity,
        unitPriceCents: li.unitPriceCents,
        totalCents: li.quantity * li.unitPriceCents,
        sortOrder: i,
      })),
    };
  }

  const isValid =
    customerName.trim().length > 0 &&
    lineItems.length > 0 &&
    lineItems.every(
      (li) => li.description.trim() && li.quantity > 0 && li.unitPriceCents > 0,
    ) &&
    dueDate >= issueDate;

  const inputClass = cn(
    "h-11 w-full rounded-xl bg-secondary/50 px-4 text-sm outline-none",
    "transition-colors focus:ring-2 focus:ring-foreground/10",
    "placeholder:text-muted-foreground/50",
  );

  return (
    <div className="space-y-6">
      {/* Customer section */}
      <div
        className={cn(
          "space-y-4 rounded-2xl bg-card p-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <h3 className="text-sm font-semibold">Customer</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Name *" error={errors.customerName}>
            <input
              type="text"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                clearField("customerName");
              }}
              placeholder="Customer name"
              className={inputClass}
            />
          </FormField>
          <FormField label="Email" error={errors.customerEmail}>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => {
                setCustomerEmail(e.target.value);
                clearField("customerEmail");
              }}
              placeholder="customer@email.com"
              className={inputClass}
            />
          </FormField>
          <FormField label="Phone">
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+251..."
              className={inputClass}
            />
          </FormField>
          <FormField label="Currency" error={errors.currencyCode}>
            <select
              value={currencyCode}
              onChange={(e) =>
                setCurrencyCode(e.target.value as SupportedCurrency)
              }
              className={inputClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Line Items section */}
      <div
        className={cn(
          "space-y-4 rounded-2xl bg-card p-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <h3 className="text-sm font-semibold">Line Items</h3>

        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[2fr_0.6fr_1fr_1fr_auto] gap-3 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Description
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Qty
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Unit Price
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Total
          </span>
          <span className="w-9" />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {lineItems.map((li) => (
            <div
              key={li.key}
              className="grid gap-2 md:grid-cols-[2fr_0.6fr_1fr_1fr_auto] md:items-center md:gap-3"
            >
              <input
                type="text"
                value={li.description}
                onChange={(e) =>
                  updateLineItem(li.key, "description", e.target.value)
                }
                placeholder="Item description"
                className={inputClass}
              />
              <input
                type="number"
                min="1"
                value={li.quantity}
                onChange={(e) =>
                  updateLineItem(
                    li.key,
                    "quantity",
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className={inputClass}
              />
              <input
                type="number"
                min="0"
                step="1"
                value={li.unitPriceCents / 100 || ""}
                onChange={(e) =>
                  updateLineItem(
                    li.key,
                    "unitPriceCents",
                    Math.round((parseFloat(e.target.value) || 0) * 100),
                  )
                }
                placeholder="0.00"
                className={inputClass}
              />
              <p className="flex h-11 items-center justify-end font-mono text-sm font-medium tracking-tight md:px-2">
                {formatMoney(
                  li.quantity * li.unitPriceCents,
                  currencyCode,
                  undefined,
                  0,
                )}
              </p>
              <button
                type="button"
                onClick={() => removeLineItem(li.key)}
                disabled={lineItems.length <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setLineItems((prev) => [...prev, newLineItem()])}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add Line
        </button>
      </div>

      {/* Totals section */}
      <div
        className={cn(
          "space-y-3 rounded-2xl bg-card p-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-mono text-sm font-medium tracking-tight">
            {formatMoney(subtotalCents, currencyCode, undefined, 0)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tax</span>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={taxPercent || ""}
              onChange={(e) =>
                setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))
              }
              className="h-8 w-16 rounded-lg bg-secondary/50 px-2 text-center text-sm outline-none focus:ring-2 focus:ring-foreground/10"
              placeholder="0"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <span className="font-mono text-sm font-medium tracking-tight">
            {formatMoney(taxCents, currencyCode, undefined, 0)}
          </span>
        </div>

        <div className="border-t border-border/40 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-mono text-lg font-semibold tracking-tight">
              {formatMoney(totalCents, currencyCode, undefined, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div
        className={cn(
          "space-y-4 rounded-2xl bg-card p-5",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <h3 className="text-sm font-semibold">Details</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Issue Date" error={errors.issueDate}>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => {
                setIssueDate(e.target.value);
                clearField("issueDate");
              }}
              className={inputClass}
            />
          </FormField>
          <FormField label="Due Date" error={errors.dueDate}>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearField("dueDate");
              }}
              className={inputClass}
            />
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, bank details, etc."
            rows={3}
            className={cn(inputClass, "h-auto py-3 resize-none")}
          />
        </FormField>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={() => {
            if (!validate()) return;
            onSaveDraft(buildRequest());
          }}
          disabled={!isValid || isSubmitting}
          className={cn(
            "h-11 rounded-xl border border-foreground/20 px-6 text-sm font-medium",
            "transition-colors hover:bg-secondary/60",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={() => {
            if (!validate()) return;
            onSend(buildRequest());
          }}
          disabled={!isValid || isSubmitting}
          className={cn(
            "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
            "transition-opacity hover:opacity-90 active:opacity-80",
            "disabled:opacity-40 disabled:pointer-events-none",
          )}
        >
          {isSubmitting ? "Sending..." : "Send Invoice"}
        </button>
      </div>
    </div>
  );
}

// Export form state for preview to consume
export type { LineItemDraft };
