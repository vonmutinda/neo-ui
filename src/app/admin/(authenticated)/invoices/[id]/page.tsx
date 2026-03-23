"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminInvoice } from "@/hooks/admin/use-admin-invoices";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: inv, isLoading } = useAdminInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!inv) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Invoice not found
      </p>
    );
  }

  const currency = inv.currencyCode as SupportedCurrency;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/invoices">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">{inv.invoiceNumber}</h2>
          <p className="text-sm text-muted-foreground">
            Business: {inv.businessId?.slice(0, 8)}…
          </p>
        </div>
        <StatusBadge status={inv.status} />
      </div>

      {/* Invoice Details */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Invoice Details
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium">{inv.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{inv.customerEmail ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Issue Date</p>
            <p className="text-sm font-medium">
              {inv.issueDate
                ? new Date(inv.issueDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="text-sm font-medium">
              {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Amounts */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Amounts
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-sm font-medium font-tabular">
              {formatMoney(inv.subtotalCents, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tax</p>
            <p className="text-sm font-medium font-tabular">
              {formatMoney(inv.taxCents, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-semibold font-tabular">
              {formatMoney(inv.totalCents, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-sm font-medium font-tabular text-green-600">
              {formatMoney(inv.paidCents, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {inv.lineItems && inv.lineItems.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Line Items
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-muted-foreground">
                  Description
                </th>
                <th className="pb-2 text-right font-medium text-muted-foreground">
                  Qty
                </th>
                <th className="pb-2 text-right font-medium text-muted-foreground">
                  Unit Price
                </th>
                <th className="pb-2 text-right font-medium text-muted-foreground">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {inv.lineItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right font-tabular">
                    {item.quantity}
                  </td>
                  <td className="py-2 text-right font-tabular">
                    {formatMoney(item.unitPriceCents, currency)}
                  </td>
                  <td className="py-2 text-right font-tabular">
                    {formatMoney(item.totalCents, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Notes */}
      {inv.notes && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            Notes
          </h3>
          <p className="text-sm">{inv.notes}</p>
        </div>
      )}
    </div>
  );
}
