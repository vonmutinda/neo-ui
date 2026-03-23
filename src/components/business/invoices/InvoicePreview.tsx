"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

interface PreviewLineItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

interface PreviewData {
  customerName: string;
  customerEmail?: string;
  currencyCode: SupportedCurrency;
  lineItems: PreviewLineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
}

interface InvoicePreviewProps {
  data: PreviewData;
  businessName: string;
}

function formatPreviewDate(dateStr: string): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InvoicePreview({ data, businessName }: InvoicePreviewProps) {
  const hasItems = data.lineItems.some((li) => li.description.trim());

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-6",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">
            {businessName || "Your Business"}
          </p>
          <p className="text-xs text-muted-foreground">Invoice</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          DRAFT
        </span>
      </div>

      <div className="my-5 border-t border-border/40" />

      {/* Bill To / From */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Bill To
          </p>
          <p className="mt-1 text-sm font-medium">
            {data.customerName || "Customer Name"}
          </p>
          {data.customerEmail && (
            <p className="text-xs text-muted-foreground">
              {data.customerEmail}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Dates
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Issued: {formatPreviewDate(data.issueDate)}
          </p>
          <p className="text-xs text-muted-foreground">
            Due: {formatPreviewDate(data.dueDate)}
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-border/40" />

      {/* Line items */}
      {hasItems ? (
        <div className="space-y-1">
          <div className="grid grid-cols-[2fr_0.5fr_1fr_1fr] gap-2 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Item
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">
              Qty
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
              Price
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
              Total
            </span>
          </div>

          {data.lineItems
            .filter((li) => li.description.trim())
            .map((li, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_0.5fr_1fr_1fr] gap-2 rounded-lg px-1 py-1.5"
              >
                <p className="truncate text-xs">{li.description}</p>
                <p className="text-center text-xs tabular-nums">
                  {li.quantity}
                </p>
                <p className="text-right font-mono text-xs tracking-tight">
                  {formatMoney(
                    li.unitPriceCents,
                    data.currencyCode,
                    undefined,
                    0,
                  )}
                </p>
                <p className="text-right font-mono text-xs tracking-tight">
                  {formatMoney(
                    li.quantity * li.unitPriceCents,
                    data.currencyCode,
                    undefined,
                    0,
                  )}
                </p>
              </div>
            ))}
        </div>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground/50">
          Add line items to see preview
        </p>
      )}

      <div className="my-4 border-t border-border/40" />

      {/* Totals */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Subtotal</span>
          <span className="font-mono text-xs font-medium tracking-tight">
            {formatMoney(data.subtotalCents, data.currencyCode, undefined, 0)}
          </span>
        </div>
        {data.taxCents > 0 && (
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Tax</span>
            <span className="font-mono text-xs font-medium tracking-tight">
              {formatMoney(data.taxCents, data.currencyCode, undefined, 0)}
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-border/40 pt-2">
          <span className="text-sm font-semibold">Total</span>
          <span className="font-mono text-sm font-semibold tracking-tight">
            {formatMoney(data.totalCents, data.currencyCode, undefined, 0)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <>
          <div className="my-4 border-t border-border/40" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
              {data.notes}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
