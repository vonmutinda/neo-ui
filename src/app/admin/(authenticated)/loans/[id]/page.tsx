"use client";

import { use } from "react";
import Link from "next/link";
import { useAdminLoan } from "@/hooks/admin/use-admin-loans";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: loan, isLoading } = useAdminLoan(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <p className="py-12 text-center text-muted-foreground">Loan not found</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/loans">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold font-mono">{loan.id}</h2>
          <p className="text-sm text-muted-foreground">
            User ID: {loan.userId}
          </p>
        </div>
        <StatusBadge status={loan.status} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
          Loan Summary
        </h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Principal</dt>
            <dd className="font-tabular text-lg font-semibold">
              ETB{" "}
              {((loan.principalAmountCents ?? 0) / 100).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Interest Fee</dt>
            <dd className="font-tabular text-lg font-semibold">
              ETB{" "}
              {((loan.interestFeeCents ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Total Due</dt>
            <dd className="font-tabular text-lg font-semibold">
              ETB{" "}
              {((loan.totalDueCents ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Remaining</dt>
            <dd className="font-tabular text-lg font-semibold">
              ETB{" "}
              {((loan.remainingCents ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Disbursed</dt>
            <dd className="text-sm">
              {new Date(loan.disbursedAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Due Date</dt>
            <dd className="text-sm">
              {new Date(loan.dueDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Days Past Due</dt>
            <dd className="text-sm">{loan.daysPastDue}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Duration</dt>
            <dd className="text-sm">{loan.durationDays} days</dd>
          </div>
        </dl>
      </div>

      {loan.installments && loan.installments.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
            Installments
          </h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Amount Due</th>
                  <th className="px-4 py-3 font-semibold">Amount Paid</th>
                  <th className="px-4 py-3 font-semibold">Due Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loan.installments.map((inst) => (
                  <tr
                    key={inst.installmentNumber}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{inst.installmentNumber}</td>
                    <td className="px-4 py-3 font-tabular">
                      {((inst.amountDueCents ?? 0) / 100).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                    <td className="px-4 py-3 font-tabular">
                      {((inst.amountPaidCents ?? 0) / 100).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(inst.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={inst.isPaid ? "completed" : "pending"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
