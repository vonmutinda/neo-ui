"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getPaymentMethodLabel } from "@/lib/business-utils";
import { ImportStatusBadge } from "./ImportStatusBadge";
import { ImportTimeline } from "./ImportTimeline";
import type { ImportRequest } from "@/lib/business-types";

interface ImportDetailViewProps {
  importReq: ImportRequest;
  canManage: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isCancelling: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ImportDetailView({
  importReq,
  canManage,
  onSubmit,
  onCancel,
  isSubmitting,
  isCancelling,
}: ImportDetailViewProps) {
  const canSubmitImport = canManage && importReq.status === "draft";
  const canCancelImport =
    canManage &&
    importReq.status !== "completed" &&
    importReq.status !== "cancelled" &&
    importReq.status !== "rejected";

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
                {importReq.referenceNumber}
              </h2>
              <ImportStatusBadge status={importReq.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDate(importReq.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {formatMoney(
                importReq.proformaAmountCents,
                importReq.proformaCurrency,
                undefined,
                0,
              )}
            </p>
            {importReq.allocatedFxAmountCents != null &&
              importReq.allocatedFxAmountCents > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  ~
                  {formatMoney(
                    importReq.allocatedFxAmountCents,
                    "ETB",
                    undefined,
                    0,
                  )}{" "}
                  ETB
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={cardClass}>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Progress
        </h3>
        <ImportTimeline currentStatus={importReq.status} />
      </div>

      {/* Details grid */}
      <div className={cardClass}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="Supplier" value={importReq.supplierName} />
          <DetailRow label="Country" value={importReq.supplierCountry} />
          <DetailRow
            label="Goods"
            value={importReq.goodsDescription}
            fullWidth
          />
          {importReq.hsCode && (
            <DetailRow label="HS Code" value={importReq.hsCode} />
          )}
          {importReq.paymentMethod && (
            <DetailRow
              label="Payment Method"
              value={getPaymentMethodLabel(importReq.paymentMethod)}
            />
          )}
          {importReq.allocatedFxRate != null && (
            <DetailRow
              label="FX Rate"
              value={String(importReq.allocatedFxRate)}
            />
          )}
          {importReq.insuranceAmountCents != null &&
            importReq.insuranceAmountCents > 0 && (
              <DetailRow
                label="Insurance"
                value={formatMoney(
                  importReq.insuranceAmountCents,
                  "ETB",
                  undefined,
                  0,
                )}
              />
            )}
          {importReq.insuranceProvider && (
            <DetailRow
              label="Insurance Provider"
              value={importReq.insuranceProvider}
            />
          )}
          {importReq.portOfEntry && (
            <DetailRow label="Port of Entry" value={importReq.portOfEntry} />
          )}
          {importReq.expectedArrivalDate && (
            <DetailRow
              label="Expected Arrival"
              value={formatDate(importReq.expectedArrivalDate)}
            />
          )}
        </div>
      </div>

      {/* Documents */}
      {importReq.documents && importReq.documents.length > 0 && (
        <div className={cardClass}>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Documents
          </h3>
          <div className="divide-y divide-border/40">
            {importReq.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.documentType}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    doc.status === "verified"
                      ? "bg-success/10 text-success-foreground"
                      : doc.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-warning/10 text-warning-foreground",
                  )}
                >
                  {doc.status === "verified"
                    ? "Verified"
                    : doc.status === "rejected"
                      ? "Rejected"
                      : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {canManage && (canSubmitImport || canCancelImport) && (
        <div className="flex flex-wrap items-center gap-3 pb-8">
          {canSubmitImport && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={cn(
                "h-11 rounded-xl bg-foreground px-6 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
                "disabled:opacity-40 disabled:pointer-events-none",
              )}
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </button>
          )}

          {canCancelImport && (
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
              {isCancelling ? "Cancelling..." : "Cancel Import"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
