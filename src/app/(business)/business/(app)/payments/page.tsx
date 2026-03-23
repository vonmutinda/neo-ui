"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessStore } from "@/providers/business-store";
import { useBatchPayments } from "@/hooks/business/use-batch-payments";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { BatchPaymentsList } from "@/components/business/payments/BatchPaymentsList";
import { BatchPaymentsSkeleton } from "@/components/business/payments/BatchPaymentsSkeleton";
import type { BatchPaymentStatus } from "@/lib/business-types";

type TabValue = "all" | BatchPaymentStatus;

const PAGE_SIZE = 20;

const TABS: { value: TabValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "approved", label: "Approved" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function BatchPaymentsPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [tab, setTab] = useState<TabValue>("all");
  const [offset, setOffset] = useState(0);

  const filter = useMemo(
    () => ({
      status: tab === "all" ? undefined : tab,
      limit: PAGE_SIZE,
      offset,
    }),
    [tab, offset],
  );

  const { data: result, isLoading } = useBatchPayments(
    activeBusinessId,
    filter,
  );

  const canCreate = permissions?.includes("biz:batch:create") ?? false;

  if (isLoading) return <BatchPaymentsSkeleton />;

  const batches = result?.data ?? [];
  const total = result?.pagination?.total ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Payments"
        rightSlot={
          canCreate ? (
            <Link
              href="/business/payments/new"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Batch
            </Link>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => {
              setTab(t.value);
              setOffset(0);
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              tab === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <BatchPaymentsList
        batches={batches}
        total={total}
        page={currentPage}
        onPageChange={(p) => setOffset((p - 1) * PAGE_SIZE)}
      />
    </div>
  );
}
