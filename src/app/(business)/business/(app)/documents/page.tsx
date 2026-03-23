"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useDocuments,
  useExpiringDocuments,
  useDeleteDocument,
} from "@/hooks/business/use-documents";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentMetrics } from "@/components/business/documents/DocumentMetrics";
import { DocumentsList } from "@/components/business/documents/DocumentsList";
import { DocumentsSkeleton } from "@/components/business/documents/DocumentsSkeleton";
import type { BusinessDocument } from "@/lib/business-types";

type DocTab = "all" | "kyb" | "trade" | "financial";

const TABS: { value: DocTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "kyb", label: "KYB" },
  { value: "trade", label: "Trade" },
  { value: "financial", label: "Financial" },
];

const TAB_TYPES: Record<DocTab, string | undefined> = {
  all: undefined,
  kyb: "kyb",
  trade: "trade",
  financial: "financial",
};

export default function DocumentsPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [activeTab, setActiveTab] = useState<DocTab>("all");

  const filter = useMemo(
    () => ({
      documentType: TAB_TYPES[activeTab],
      limit: 50,
    }),
    [activeTab],
  );

  const { data: result, isLoading } = useDocuments(activeBusinessId, filter);
  const { data: expiring } = useExpiringDocuments(activeBusinessId);
  const deleteDoc = useDeleteDocument(activeBusinessId);

  const canManage = permissions?.includes("biz:documents:manage") ?? false;

  if (isLoading) return <DocumentsSkeleton />;

  const documents = result?.data ?? [];
  const expiringCount = expiring?.count ?? 0;

  function handleDelete(doc: BusinessDocument) {
    deleteDoc.mutate(doc.id, {
      onSuccess: () => toast.success("Document deleted"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        rightSlot={
          canManage ? (
            <button
              onClick={() =>
                toast.info("File upload requires backend upload URL flow")
              }
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          ) : undefined
        }
      />

      {/* Expiring alert */}
      {expiringCount > 0 && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl p-4",
            "bg-destructive/5 ring-1 ring-destructive/20",
          )}
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">{expiringCount}</span>{" "}
            {expiringCount === 1 ? "document is" : "documents are"} expiring
            soon. Review and renew to avoid compliance issues.
          </p>
        </div>
      )}

      {/* Metrics */}
      <DocumentMetrics documents={documents} />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <DocumentsList
        documents={documents}
        canManage={canManage}
        onDelete={handleDelete}
      />
    </div>
  );
}
