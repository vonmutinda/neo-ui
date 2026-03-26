"use client";

import { formatMoney } from "@/lib/format";
import { ExportStatusBadge } from "./ExportStatusBadge";
import { Button } from "@/components/ui/button";
import type { ExportRequest } from "@/lib/business-types";

interface ExportDetailViewProps {
  exportReq: ExportRequest;
  canManage: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onEdit?: () => void;
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

export function ExportDetailView({
  exportReq,
  canManage,
  onSubmit,
  onCancel,
  onEdit,
  isSubmitting,
  isCancelling,
}: ExportDetailViewProps) {
  const isDraft = exportReq.status === "draft";

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-muted-foreground">
              {exportReq.referenceNumber}
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {exportReq.buyerName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {exportReq.buyerCountry}
            </p>
          </div>
          <ExportStatusBadge status={exportReq.status} />
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-border/40 bg-card p-5">
        <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
          Export Details
        </h4>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Type</dt>
            <dd className="text-sm font-medium capitalize">
              {exportReq.exportType}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contract Amount</dt>
            <dd className="font-tabular text-sm font-medium">
              {formatMoney(
                exportReq.contractAmountCents,
                exportReq.contractCurrency,
                undefined,
                0,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Surrender Percentage
            </dt>
            <dd className="text-sm font-medium">
              {exportReq.surrenderPercentage}%
            </dd>
          </div>
          {exportReq.hsCode && (
            <div>
              <dt className="text-xs text-muted-foreground">HS Code</dt>
              <dd className="font-mono text-sm">{exportReq.hsCode}</dd>
            </div>
          )}
          {exportReq.shipmentDate && (
            <div>
              <dt className="text-xs text-muted-foreground">Shipment Date</dt>
              <dd className="text-sm">{formatDate(exportReq.shipmentDate)}</dd>
            </div>
          )}
          {exportReq.repatriationDeadline && (
            <div>
              <dt className="text-xs text-muted-foreground">
                Repatriation Deadline
              </dt>
              <dd className="text-sm">
                {formatDate(exportReq.repatriationDeadline)}
              </dd>
            </div>
          )}
          {exportReq.bankPermitNumber && (
            <div>
              <dt className="text-xs text-muted-foreground">
                Bank Permit Number
              </dt>
              <dd className="font-mono text-sm">
                {exportReq.bankPermitNumber}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Created</dt>
            <dd className="text-sm">{formatDate(exportReq.createdAt)}</dd>
          </div>
        </dl>
        {exportReq.description && (
          <div className="mt-4 border-t border-border/30 pt-4">
            <dt className="text-xs text-muted-foreground">Description</dt>
            <dd className="mt-1 text-sm">{exportReq.description}</dd>
          </div>
        )}
      </div>

      {/* Proceeds / Surrender summary */}
      {(exportReq.proceedsAmountCents != null ||
        exportReq.surrenderedAmountCents > 0) && (
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
            Financial Summary
          </h4>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {exportReq.proceedsAmountCents != null && (
              <div>
                <dt className="text-xs text-muted-foreground">
                  Proceeds Received
                </dt>
                <dd className="font-tabular text-sm font-medium">
                  {formatMoney(
                    exportReq.proceedsAmountCents,
                    exportReq.contractCurrency,
                    undefined,
                    0,
                  )}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Surrendered</dt>
              <dd className="font-tabular text-sm font-medium">
                {formatMoney(
                  exportReq.surrenderedAmountCents,
                  exportReq.contractCurrency,
                  undefined,
                  0,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Retained</dt>
              <dd className="font-tabular text-sm font-medium">
                {formatMoney(
                  exportReq.retainedAmountCents,
                  exportReq.contractCurrency,
                  undefined,
                  0,
                )}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Documents */}
      {exportReq.documents && exportReq.documents.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <h4 className="mb-4 text-sm font-semibold text-muted-foreground">
            Documents ({exportReq.documents.length})
          </h4>
          <div className="space-y-2">
            {exportReq.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-border/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {doc.documentType.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground capitalize">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {canManage && isDraft && (
        <div className="flex gap-3">
          {onEdit && (
            <Button variant="outline" className="rounded-xl" onClick={onEdit}>
              Edit
            </Button>
          )}
          <Button
            className="rounded-xl"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting\u2026" : "Submit for Review"}
          </Button>
          <Button
            variant="ghost"
            className="rounded-xl text-destructive"
            onClick={onCancel}
            disabled={isCancelling}
          >
            {isCancelling ? "Cancelling\u2026" : "Cancel Export"}
          </Button>
        </div>
      )}
    </div>
  );
}
