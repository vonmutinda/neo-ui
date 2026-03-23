"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { ExportStatusBadge } from "./ExportStatusBadge";
import type { ExportRequest } from "@/lib/business-types";

interface ExportDetailViewProps {
  exportReq: ExportRequest;
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

export function ExportDetailView({
  exportReq,
  canManage,
  onSubmit,
  onCancel,
  isSubmitting,
  isCancelling,
}: ExportDetailViewProps) {
  const canSubmitExport = canManage && exportReq.status === "draft";
  const canCancelExport =
    canManage &&
    exportReq.status !== "completed" &&
    exportReq.status !== "cancelled" &&
    exportReq.status !== "rejected";

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
                {exportReq.referenceNumber}
              </h2>
              <ExportStatusBadge status={exportReq.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDate(exportReq.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {formatMoney(
                exportReq.contractAmountCents,
                exportReq.contractCurrency,
                undefined,
                0,
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className={cardClass}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow
            label="Type"
            value={exportReq.exportType === "goods" ? "Goods" : "Services"}
          />
          <DetailRow label="Buyer" value={exportReq.buyerName} />
          <DetailRow label="Country" value={exportReq.buyerCountry} />
          <DetailRow
            label="Description"
            value={exportReq.description}
            fullWidth
          />
          {exportReq.hsCode && (
            <DetailRow label="HS Code" value={exportReq.hsCode} />
          )}
          <DetailRow
            label="Contract Amount"
            value={formatMoney(
              exportReq.contractAmountCents,
              exportReq.contractCurrency,
              undefined,
              0,
            )}
          />
          {exportReq.expectedProceedsDate && (
            <DetailRow
              label="Expected Proceeds"
              value={formatDate(exportReq.expectedProceedsDate)}
            />
          )}
        </div>
      </div>

      {/* Documents */}
      {exportReq.documents && exportReq.documents.length > 0 && (
        <div className={cardClass}>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Documents
          </h3>
          <div className="divide-y divide-border/40">
            {exportReq.documents.map((doc) => (
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
      {canManage && (canSubmitExport || canCancelExport) && (
        <div className="flex flex-wrap items-center gap-3 pb-8">
          {canSubmitExport && (
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

          {canCancelExport && (
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
              {isCancelling ? "Cancelling..." : "Cancel Export"}
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
