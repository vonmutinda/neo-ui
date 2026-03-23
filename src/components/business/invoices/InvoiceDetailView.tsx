"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { Invoice } from "@/lib/business-types";

interface InvoiceDetailViewProps {
  invoice: Invoice;
  canManage: boolean;
  onSend: () => void;
  onRecordPayment: () => void;
  onCancel: () => void;
  isSending: boolean;
  isCancelling: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPaidPercent(invoice: Invoice): number {
  if (invoice.totalCents === 0) return 0;
  return Math.min(
    100,
    Math.round((invoice.paidCents / invoice.totalCents) * 100),
  );
}

export function InvoiceDetailView({
  invoice,
  canManage,
  onSend,
  onRecordPayment,
  onCancel,
  isSending,
  isCancelling,
}: InvoiceDetailViewProps) {
  const paidPct = getPaidPercent(invoice);
  const canSend = canManage && invoice.status === "draft";
  const canRecord =
    canManage &&
    (invoice.status === "sent" ||
      invoice.status === "viewed" ||
      invoice.status === "partially_paid");
  const canCancelInvoice =
    canManage && invoice.status !== "paid" && invoice.status !== "cancelled";

  const cardClass = cn(
    "rounded-2xl bg-card p-5",
    "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
  );

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-lg font-semibold tracking-tight">
                {invoice.invoiceNumber}
              </h2>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Issued {formatDate(invoice.issueDate)} &middot; Due{" "}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {formatMoney(
                invoice.totalCents,
                invoice.currencyCode,
                undefined,
                0,
              )}
            </p>
            {invoice.paidCents > 0 &&
              invoice.paidCents < invoice.totalCents && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatMoney(
                    invoice.paidCents,
                    invoice.currencyCode,
                    undefined,
                    0,
                  )}{" "}
                  paid ({paidPct}%)
                </p>
              )}
          </div>
        </div>

        {/* Payment progress */}
        {invoice.paidCents > 0 && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  paidPct === 100
                    ? "bg-success-foreground"
                    : "bg-warning-foreground",
                )}
                style={{ width: `${paidPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Customer info */}
      <div className={cardClass}>
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Customer
        </h3>
        <p className="mt-2 text-sm font-medium">{invoice.customerName}</p>
        {invoice.customerEmail && (
          <p className="text-sm text-muted-foreground">
            {invoice.customerEmail}
          </p>
        )}
        {invoice.customerPhone && (
          <p className="text-sm text-muted-foreground">
            {invoice.customerPhone}
          </p>
        )}
      </div>

      {/* Line items */}
      <div className={cardClass}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Items
        </h3>

        {/* Header */}
        <div className="hidden md:grid md:grid-cols-[2fr_0.5fr_1fr_1fr] gap-3 px-1 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Description
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">
            Qty
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Unit Price
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">
            Total
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {invoice.lineItems.map((li) => (
            <div
              key={li.id}
              className="grid gap-1 py-2.5 md:grid-cols-[2fr_0.5fr_1fr_1fr] md:items-center md:gap-3 md:px-1"
            >
              <p className="text-sm">{li.description}</p>
              <p className="text-center text-sm tabular-nums text-muted-foreground">
                {li.quantity}
              </p>
              <p className="font-mono text-sm font-medium tracking-tight md:text-right">
                {formatMoney(
                  li.unitPriceCents,
                  invoice.currencyCode,
                  undefined,
                  0,
                )}
              </p>
              <p className="font-mono text-sm font-medium tracking-tight md:text-right">
                {formatMoney(li.totalCents, invoice.currencyCode, undefined, 0)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="font-mono text-sm font-medium tracking-tight">
              {formatMoney(
                invoice.subtotalCents,
                invoice.currencyCode,
                undefined,
                0,
              )}
            </span>
          </div>
          {invoice.taxCents > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span className="font-mono text-sm font-medium tracking-tight">
                {formatMoney(
                  invoice.taxCents,
                  invoice.currencyCode,
                  undefined,
                  0,
                )}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border/40 pt-2">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-mono text-base font-semibold tracking-tight">
              {formatMoney(
                invoice.totalCents,
                invoice.currencyCode,
                undefined,
                0,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className={cardClass}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Notes
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Payment link */}
      {invoice.paymentLink && (
        <div className={cardClass}>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Payment Link
          </h3>
          <p className="mt-2 break-all font-mono text-xs text-primary">
            {invoice.paymentLink}
          </p>
        </div>
      )}

      {/* Actions */}
      {canManage && (canSend || canRecord || canCancelInvoice) && (
        <div className="flex flex-wrap items-center gap-3 pb-8">
          {canSend && (
            <button
              type="button"
              onClick={onSend}
              disabled={isSending}
              className={cn(
                "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {isSending ? "Sending..." : "Send Invoice"}
            </button>
          )}

          {canRecord && (
            <button
              type="button"
              onClick={onRecordPayment}
              className={cn(
                "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              Record Payment
            </button>
          )}

          {canCancelInvoice && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isCancelling}
              className={cn(
                "h-11 rounded-xl border border-destructive/30 px-6 text-sm font-medium text-destructive",
                "transition-colors hover:bg-destructive/10",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {isCancelling ? "Cancelling..." : "Cancel Invoice"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
