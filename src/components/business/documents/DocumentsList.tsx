"use client";

import { cn } from "@/lib/utils";
import { FileText, Trash2, ExternalLink } from "lucide-react";
import type { BusinessDocument } from "@/lib/business-types";

interface DocumentsListProps {
  documents: BusinessDocument[];
  onDelete?: (doc: BusinessDocument) => void;
  canManage: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isExpiringUrgent(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffDays = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

function isExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function DocumentsList({
  documents,
  onDelete,
  canManage,
}: DocumentsListProps) {
  if (documents.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No documents found
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
      <div className="divide-y divide-border/40">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/30"
          >
            {/* File icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {doc.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {doc.documentType} &middot; {formatFileSize(doc.fileSizeBytes)}{" "}
                &middot; {doc.uploadedBy} &middot; {formatDate(doc.createdAt)}
              </p>
            </div>

            {/* Expiry */}
            {doc.expiresAt && (
              <div className="shrink-0 text-right">
                <p
                  className={cn(
                    "text-xs",
                    isExpired(doc.expiresAt)
                      ? "font-medium text-destructive"
                      : isExpiringUrgent(doc.expiresAt)
                        ? "font-medium text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {isExpired(doc.expiresAt)
                    ? "Expired"
                    : `Expires ${formatDate(doc.expiresAt)}`}
                </p>
              </div>
            )}

            {/* Status */}
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                doc.isArchived
                  ? "bg-muted text-muted-foreground"
                  : "bg-success/10 text-success-foreground",
              )}
            >
              {doc.isArchived ? "Archived" : "Active"}
            </span>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                aria-label="View document"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {canManage && onDelete && (
                <button
                  onClick={() => onDelete(doc)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-destructive/10"
                  aria-label="Delete document"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
