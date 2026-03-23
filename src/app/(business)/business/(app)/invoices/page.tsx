"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessStore } from "@/providers/business-store";
import { useInvoices, useInvoiceSummary } from "@/hooks/business/use-invoices";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceMetrics } from "@/components/business/invoices/InvoiceMetrics";
import { InvoiceTable } from "@/components/business/invoices/InvoiceTable";
import { InvoicesSkeleton } from "@/components/business/invoices/InvoicesSkeleton";
import type { InvoiceStatus } from "@/lib/business-types";

const PAGE_SIZE = 20;

export default function InvoicesPage() {
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();
  const [page, setPage] = useState(1);

  const filter = useMemo(
    () => ({
      status: statusFilter,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [statusFilter, page],
  );

  const { data: result, isLoading } = useInvoices(activeBusinessId, filter);
  const { data: summary } = useInvoiceSummary(activeBusinessId);

  const canManage = permissions?.includes("biz:invoices:manage") ?? false;

  if (isLoading) return <InvoicesSkeleton />;

  const invoices = result?.data ?? [];
  const total = result?.pagination?.total ?? 0;

  // Use primary currency from business or fallback to ETB
  const currencyCode = activeBusiness?.market === "US" ? "USD" : "ETB";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        rightSlot={
          canManage ? (
            <Link
              href="/business/invoices/new"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Link>
          ) : undefined
        }
      />

      {/* Metrics */}
      {summary && (
        <InvoiceMetrics summary={summary} currencyCode={currencyCode} />
      )}

      {/* Table */}
      <InvoiceTable
        invoices={invoices}
        total={total}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
