"use client";

import { useState } from "react";
import { useAdminReconRuns, useAdminReconExceptions } from "@/hooks/admin/use-admin-recon";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ExceptionFilter } from "@/lib/admin-types";

export default function ReconciliationPage() {
  const [runsPagination, setRunsPagination] = useState({ limit: 10, offset: 0 });
  const [exceptionsFilter, setExceptionsFilter] = useState<ExceptionFilter>({ limit: 20, offset: 0 });

  const { data: runsData, isLoading: runsLoading } = useAdminReconRuns(runsPagination);
  const { data: exceptionsData, isLoading: exceptionsLoading } = useAdminReconExceptions(exceptionsFilter);

  const runs = runsData?.data ?? [];
  const runsPaginationMeta = runsData?.pagination;
  const exceptions = exceptionsData?.data ?? [];
  const exceptionsPagination = exceptionsData?.pagination;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Reconciliation Runs</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Run Date</th>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-4 py-3 font-semibold">Records</th>
                <th className="px-4 py-3 font-semibold">Matched</th>
                <th className="px-4 py-3 font-semibold">Exceptions</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Started</th>
              </tr>
            </thead>
            <tbody>
              {runsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No runs found</td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">{new Date(run.runDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{run.clearingFileName}</td>
                    <td className="px-4 py-3 font-tabular">{run.totalRecords}</td>
                    <td className="px-4 py-3 font-tabular">{run.matchedCount}</td>
                    <td className="px-4 py-3 font-tabular">{run.exceptionCount}</td>
                    <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(run.startedAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {runsPaginationMeta && (
          <div className="mt-3 flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <span>Showing {runsPaginationMeta.offset + 1}–{Math.min(runsPaginationMeta.offset + runsPaginationMeta.limit, runsPaginationMeta.total)} of {runsPaginationMeta.total}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={runsPaginationMeta.offset === 0}
              onClick={() => setRunsPagination((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!runsPaginationMeta.hasMore}
              onClick={() => setRunsPagination((p) => ({ ...p, offset: p.offset + p.limit }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Exceptions</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Error Type</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assigned To</th>
                <th className="px-4 py-3 font-semibold">Difference</th>
                <th className="px-4 py-3 font-semibold">Run Date</th>
                <th className="px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {exceptionsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No exceptions found</td>
                </tr>
              ) : (
                exceptions.map((ex) => (
                  <tr key={ex.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">{ex.errorType}</td>
                    <td className="px-4 py-3"><StatusBadge status={ex.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{ex.assignedTo ?? "—"}</td>
                    <td className="px-4 py-3 font-tabular">
                      {ex.differenceCents != null ? (ex.differenceCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(ex.reconRunDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(ex.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {exceptionsPagination && (
          <div className="mt-3 flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <span>Showing {exceptionsPagination.offset + 1}–{Math.min(exceptionsPagination.offset + exceptionsPagination.limit, exceptionsPagination.total)} of {exceptionsPagination.total}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={exceptionsPagination.offset === 0}
              onClick={() => setExceptionsFilter((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - (f.limit ?? 20)) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!exceptionsPagination.hasMore}
              onClick={() => setExceptionsFilter((f) => ({ ...f, offset: (f.offset ?? 0) + (f.limit ?? 20) }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
