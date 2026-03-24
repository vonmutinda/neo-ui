"use client";

import { cn } from "@/lib/utils";
import { Download, Loader2 } from "lucide-react";
import type { BusinessStatement } from "@/lib/business-types";

interface StatementsTableProps {
  statements: BusinessStatement[];
  onDownload: (downloadUrl: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPeriod(from: string, to: string): string {
  return `${formatDate(from)} - ${formatDate(to)}`;
}

const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  csv: "CSV",
  xlsx: "Excel",
};

const STATUS_STYLES: Record<string, string> = {
  generating: "bg-warning/10 text-warning-foreground",
  ready: "bg-success/10 text-success-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export function StatementsTable({
  statements,
  onDownload,
}: StatementsTableProps) {
  if (statements.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No statements generated yet
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      {/* Header */}
      <div className="hidden gap-4 bg-muted/30 px-5 py-3 md:grid md:grid-cols-[1.5fr_0.7fr_0.6fr_0.8fr_0.5fr]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Period
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Currency
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Format
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Date
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">
          Download
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/40">
        {statements.map((stmt) => (
          <div
            key={stmt.id}
            className="grid gap-2 px-5 py-3.5 md:grid-cols-[1.5fr_0.7fr_0.6fr_0.8fr_0.5fr] md:items-center md:gap-4"
          >
            {/* Period */}
            <p className="text-sm font-medium text-foreground">
              {formatPeriod(stmt.dateFrom, stmt.dateTo)}
            </p>

            {/* Currency */}
            <p className="text-sm text-muted-foreground">
              {stmt.currency ?? "All"}
            </p>

            {/* Format */}
            <span
              className={cn(
                "inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                "bg-muted text-muted-foreground",
              )}
            >
              {FORMAT_LABELS[stmt.format] ?? stmt.format.toUpperCase()}
            </span>

            {/* Date */}
            <p className="text-sm text-muted-foreground">
              {formatDate(stmt.createdAt)}
            </p>

            {/* Download */}
            <div className="flex md:justify-center">
              {stmt.status === "ready" ? (
                <button
                  onClick={() =>
                    stmt.downloadUrl && onDownload(stmt.downloadUrl)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                  aria-label="Download statement"
                >
                  <Download className="h-4 w-4 text-foreground" />
                </button>
              ) : stmt.status === "generating" ? (
                <div className="flex h-8 w-8 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    STATUS_STYLES[stmt.status] ??
                      "bg-muted text-muted-foreground",
                  )}
                >
                  Failed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
