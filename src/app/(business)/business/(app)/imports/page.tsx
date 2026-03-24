"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessStore } from "@/providers/business-store";
import { useImports } from "@/hooks/business/use-imports";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImportsTable } from "@/components/business/imports/ImportsTable";
import { ImportsSkeleton } from "@/components/business/imports/ImportsSkeleton";
import type { ImportStatus } from "@/lib/business-types";

const PAGE_SIZE = 20;

export default function ImportsPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions, isLoading: permsLoading } =
    useMyPermissions(activeBusinessId);

  const canView = permissions?.includes("biz:imports:view") ?? false;
  const canManage = permissions?.includes("biz:imports:manage") ?? false;

  const [statusFilter, setStatusFilter] = useState<ImportStatus | undefined>();
  const [page, setPage] = useState(1);

  const filter = useMemo(
    () => ({
      status: statusFilter,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [statusFilter, page],
  );

  const {
    data: result,
    isLoading,
    isError,
  } = useImports(canView ? activeBusinessId : null, filter);

  if (permsLoading || isLoading) return <ImportsSkeleton />;

  if (!canView || isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Imports" />
        <div className="rounded-2xl border border-border/40 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {isError
              ? "Unable to load imports. Please try again later."
              : "You don\u2019t have permission to view imports for this business."}
          </p>
        </div>
      </div>
    );
  }

  const imports = result?.data ?? [];
  const total = result?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Imports"
        rightSlot={
          canManage ? (
            <Link
              href="/business/imports/new"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Import
            </Link>
          ) : undefined
        }
      />

      <ImportsTable
        imports={imports}
        total={total}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
}
