"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useLoanDetail, useRepayLoan } from "@/hooks/use-loans";
import { useWalletSummary } from "@/hooks/use-wallets";
import type { LoanStatus, LoanInstallment } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_LABEL: Record<LoanStatus, string> = {
  active: "Active",
  in_arrears: "Late",
  defaulted: "Defaulted",
  repaid: "Repaid",
  written_off: "Written off",
};

function InstallmentRow({ installment }: { installment: LoanInstallment }) {
  const isPast =
    new Date(installment.dueDate) < new Date() && !installment.isPaid;

  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">
          Installment {installment.installmentNumber}
        </p>
        <p className="text-xs text-foreground/70">
          Due {formatDate(installment.dueDate)}
          {installment.isPaid &&
            installment.paidAt &&
            ` · Paid ${formatDate(installment.paidAt)}`}
          {!installment.isPaid && isPast && " · Overdue"}
        </p>
      </div>
      <span className="font-tabular text-sm font-medium tabular-nums text-foreground">
        {formatMoney(installment.amountDueCents, "ETB")}
      </span>
    </div>
  );
}

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: loan, isLoading, isError, refetch } = useLoanDetail(id);
  const repay = useRepayLoan();
  const wallet = useWalletSummary();
  const [showRepay, setShowRepay] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");
  const [showConfirmRepay, setShowConfirmRepay] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-foreground/90">Could not load loan</p>
        <Link
          href="/loans"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Go to loans
        </Link>
      </div>
    );
  }

  const paidInstallments = loan.installments.filter((i) => i.isPaid).length;
  const remainingCents = loan.totalDueCents - loan.totalPaidCents;
  const nextUnpaid = loan.installments.find((i) => !i.isPaid);
  const nextInstallmentCents = nextUnpaid?.amountDueCents ?? remainingCents;
  const repayAmountCents = Math.round(parseFloat(repayAmount || "0") * 100);
  const repayValid = repayAmountCents > 0 && repayAmountCents <= remainingCents;
  const etbBalance = wallet.data?.balances.find((b) => b.currency === "ETB");

  function prefillRepay(cents: number) {
    setRepayAmount((cents / 100).toFixed(2));
  }

  async function handleRepay() {
    if (!repayValid || !loan) return;
    try {
      await repay.mutateAsync({ id: loan.id, amountCents: repayAmountCents });
      setShowRepay(false);
      setRepayAmount("");
      refetch();
    } catch {
      /* toast */
    }
  }

  return (
    <div className="space-y-12 pb-12">
      <PageHeader title="Loan Details" backHref="/loans" />

      <div className="rounded-2xl border border-border/60 bg-card">
        <div className="p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Principal
              </p>
              <p className="mt-1 font-tabular text-3xl font-semibold tabular-nums text-foreground">
                {formatMoney(loan.principalAmountCents, "ETB")}
              </p>
            </div>
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {STATUS_LABEL[loan.status]}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-foreground/80">
              <span>Repayment progress</span>
              <span className="font-tabular font-medium tabular-nums">
                {loan.progressPct}%
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${loan.progressPct}%` }}
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Total due
              </p>
              <p className="mt-0.5 font-tabular text-sm font-medium tabular-nums text-foreground">
                {formatMoney(loan.totalDueCents, "ETB")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Remaining
              </p>
              <p className="mt-0.5 font-tabular text-sm font-medium tabular-nums text-foreground">
                {loan.remainingDisplay}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Interest & fees
              </p>
              <p className="mt-0.5 font-tabular text-sm font-medium tabular-nums text-foreground">
                {formatMoney(loan.interestFeeCents, "ETB")}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Duration
              </p>
              <p className="mt-0.5 font-tabular text-sm font-medium tabular-nums text-foreground">
                {loan.durationDays} days
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-border/60">
          <div className="border-r border-border/60 py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Disbursed
            </p>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {formatDate(loan.disbursedAt)}
            </p>
          </div>
          <div className="py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Due date
            </p>
            <p className="mt-0.5 text-xs font-medium text-foreground">
              {formatDate(loan.dueDate)}
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Installments
          </h2>
          <span className="text-xs font-medium text-foreground">
            {paidInstallments} of {loan.installments.length} paid
          </span>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card px-4">
          {loan.installments.map((inst) => (
            <InstallmentRow key={inst.installmentNumber} installment={inst} />
          ))}
        </div>
      </section>

      {loan.daysPastDue > 0 && loan.status !== "repaid" && (
        <div className="rounded-xl border border-border/60 bg-muted/50 p-4">
          <p className="text-sm text-foreground/90">
            This loan is {loan.daysPastDue} days past due. Pay to avoid
            penalties.
          </p>
        </div>
      )}

      {(loan.status === "active" || loan.status === "in_arrears") && (
        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Make payment
          </h2>
          {!showRepay ? (
            <button
              type="button"
              onClick={() => setShowRepay(true)}
              className="w-full rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Make payment
            </button>
          ) : (
            <div className="space-y-4">
              {etbBalance && (
                <div className="flex justify-between rounded-2xl border border-border/60 bg-card px-3 py-2">
                  <span className="text-xs text-foreground/70">
                    Wallet balance
                  </span>
                  <span className="font-tabular text-sm font-medium tabular-nums text-foreground">
                    {etbBalance.display}
                  </span>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                  Amount (ETB)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={repayAmount}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || parseFloat(v) >= 0) setRepayAmount(v);
                  }}
                  min="0"
                  className="h-11 rounded-xl border border-border/60 text-base"
                />
                <p className="mt-1.5 text-xs text-foreground/80">
                  Remaining: {formatMoney(remainingCents, "ETB")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => prefillRepay(nextInstallmentCents)}
                  className={`flex-1 rounded-xl border py-2.5 px-3 text-left text-sm transition-colors ${
                    repayAmountCents === nextInstallmentCents
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-foreground/80 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <span className="block font-medium">Next installment</span>
                  <span className="font-tabular text-xs tabular-nums">
                    {formatMoney(nextInstallmentCents, "ETB")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => prefillRepay(remainingCents)}
                  className={`flex-1 rounded-xl border py-2.5 px-3 text-left text-sm transition-colors ${
                    repayAmountCents === remainingCents
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-foreground/80 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  <span className="block font-medium">Full remaining</span>
                  <span className="font-tabular text-xs tabular-nums">
                    {formatMoney(remainingCents, "ETB")}
                  </span>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRepay(false);
                    setRepayAmount("");
                  }}
                  className="flex-1 rounded-xl border border-border/60 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!repayValid || repay.isPending}
                  onClick={() => setShowConfirmRepay(true)}
                  className="flex-1 rounded-xl border border-primary bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {repay.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "Confirm payment"
                  )}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <AlertDialog open={showConfirmRepay} onOpenChange={setShowConfirmRepay}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm loan payment</AlertDialogTitle>
            <AlertDialogDescription>
              Pay {formatMoney(repayAmountCents, "ETB")} towards your loan? This
              amount will be deducted from your ETB wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleRepay();
                setShowConfirmRepay(false);
              }}
            >
              Confirm payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
