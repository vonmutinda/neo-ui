"use client";

import Link from "next/link";
import { useAdminImportList } from "@/hooks/admin/use-admin-imports";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminImportsPage() {
  const { data, isLoading } = useAdminImportList(25, 0);
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Import requests</h1>
      <p className="text-sm text-muted-foreground">
        Trade finance LC / CAD imports (all businesses).
      </p>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No import requests
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/imports/${r.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{r.supplierName}</td>
                  <td className="px-4 py-3 font-tabular">
                    {formatMoney(
                      r.proformaAmountCents,
                      r.proformaCurrency as SupportedCurrency,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
