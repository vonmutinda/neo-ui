"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wallet,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLoanDetail, useRepayLoan } from "@/hooks/use-loans";
import { useWalletSummary } from "@/hooks/use-wallets";
import type { LoanStatus, LoanInstallment, LoanDetail } from "@/lib/types";
import { formatMoney } from "@/lib/format";

function formatCents(cents: number) {
  return `ETB ${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_CONFIG: Record<
  LoanStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  active: {
    label: "Active",
    className: "bg-primary/10 text-primary border-primary/20",
    icon: <Clock className="h-4 w-4" />,
  },
  in_arrears: {
    label: "Late",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  defaulted: {
    label: "Defaulted",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-4 w-4" />,
  },
  repaid: {
    label: "Repaid",
    className: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  written_off: {
    label: "Written Off",
    className: "bg-muted text-muted-foreground border-muted",
    icon: <XCircle className="h-4 w-4" />,
  },
};

function InstallmentRow({
  installment,
  index,
}: {
  installment: LoanInstallment;
  index: number;
}) {
  const isPast = new Date(installment.dueDate) < new Date() && !installment.isPaid;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * index }}
      className="flex items-center gap-4 py-3"
    >
      {/* Status indicator */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          installment.isPaid
            ? "bg-success/10"
            : isPast
              ? "bg-destructive/10"
              : "bg-muted"
        }`}
      >
        {installment.isPaid ? (
          <CheckCircle2 className="h-4 w-4 text-success" />
        ) : isPast ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <span className="text-xs font-bold text-muted-foreground">
            {installment.installmentNumber}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Installment #{installment.installmentNumber}
          </span>
          <span className="text-sm font-semibold font-tabular">
            {formatCents(installment.amountDueCents)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Due {formatDate(installment.dueDate)}
          </span>
          {installment.isPaid && installment.paidAt && (
            <span className="text-xs text-success">
              Paid {formatDate(installment.paidAt)}
            </span>
          )}
          {!installment.isPaid && isPast && (
            <span className="text-xs text-destructive">Overdue</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function RepaymentSheet({
  open,
  onClose,
  loan,
}: {
  open: boolean;
  onClose: () => void;
  loan: LoanDetail;
}) {
  const repay = useRepayLoan();
  const wallet = useWalletSummary();
  const [amount, setAmount] = useState("");

  const remainingCents = loan.totalDueCents - loan.totalPaidCents;
  const nextUnpaid = loan.installments.find((i) => !i.isPaid);
  const nextInstallmentCents = nextUnpaid?.amountDueCents ?? remainingCents;

  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const valid = amountCents > 0 && amountCents <= remainingCents;

  function prefill(cents: number) {
    setAmount((cents / 100).toFixed(2));
  }

  async function handleRepay() {
    if (!valid) return;
    try {
      await repay.mutateAsync({ id: loan.id, amountCents });
      setAmount("");
      onClose();
    } catch {
      /* toast handles error */
    }
  }

  if (!open) return null;

  const etbBalance = wallet.data?.balances.find((b) => b.currency === "ETB");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Make Payment</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {etbBalance && (
              <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Wallet balance:
                </span>
                <span className="text-xs font-semibold font-tabular">
                  {etbBalance.display}
                </span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Amount (ETB)
              </label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-lg"
                autoFocus
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Remaining: {formatMoney(remainingCents, "ETB")}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => prefill(nextInstallmentCents)}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  amountCents === nextInstallmentCents
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-card text-muted-foreground"
                }`}
              >
                Next Installment
                <span className="mt-0.5 block text-xs font-tabular">
                  {formatMoney(nextInstallmentCents, "ETB")}
                </span>
              </button>
              <button
                onClick={() => prefill(remainingCents)}
                className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  amountCents === remainingCents
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-card text-muted-foreground"
                }`}
              >
                Full Remaining
                <span className="mt-0.5 block text-xs font-tabular">
                  {formatMoney(remainingCents, "ETB")}
                </span>
              </button>
            </div>

            <Button
              size="lg"
              disabled={!valid || repay.isPending}
              onClick={handleRepay}
              className="mt-4 h-14 w-full text-base font-semibold"
            >
              {repay.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: loan, isLoading, isError } = useLoanDetail(id);
  const [showRepay, setShowRepay] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !loan) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/loans"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Loan Detail</h1>
        </div>
        <div className="flex flex-col items-center gap-2 py-20">
          <p className="text-muted-foreground">Could not load loan details</p>
          <Link href="/loans" className="text-sm font-medium text-primary">
            Back to Loans
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[loan.status];
  const paidInstallments = loan.installments.filter((i) => i.isPaid).length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/loans"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Loan Detail</h1>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border bg-card"
      >
        <div className="space-y-4 p-6">
          {/* Status badge & principal */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Principal
              </p>
              <p className="mt-1 text-3xl font-bold font-tabular">
                {formatCents(loan.principalAmountCents)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`gap-1 ${status.className}`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Repayment progress</span>
              <span className="font-tabular font-medium">{loan.progressPct}%</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full ${
                  loan.status === "repaid"
                    ? "bg-success"
                    : loan.status === "defaulted" || loan.status === "in_arrears"
                      ? "bg-warning"
                      : "bg-primary"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${loan.progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>

          {/* Financial details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Total Due</p>
              <p className="mt-0.5 text-sm font-bold font-tabular">
                {formatCents(loan.totalDueCents)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="mt-0.5 text-sm font-bold font-tabular">
                {loan.remainingDisplay}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Interest & Fees</p>
              <p className="mt-0.5 text-sm font-bold font-tabular">
                {formatCents(loan.interestFeeCents)}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="mt-0.5 text-sm font-bold font-tabular">
                {loan.durationDays} days
              </p>
            </div>
          </div>
        </div>

        {/* Date row */}
        <div className="grid grid-cols-2 gap-px border-t bg-border">
          <div className="flex flex-col items-center gap-0.5 bg-card py-3">
            <span className="text-xs text-muted-foreground">Disbursed</span>
            <span className="text-xs font-medium">{formatDate(loan.disbursedAt)}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 bg-card py-3">
            <span className="text-xs text-muted-foreground">Due Date</span>
            <span className="text-xs font-medium">{formatDate(loan.dueDate)}</span>
          </div>
        </div>
      </motion.div>

      {/* Installment schedule */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Installment Schedule
          </h2>
          <span className="text-xs text-muted-foreground">
            {paidInstallments}/{loan.installments.length} paid
          </span>
        </div>

        <div className="rounded-2xl border bg-card px-4">
          {loan.installments.map((inst, i) => (
            <div key={inst.installmentNumber}>
              <InstallmentRow installment={inst} index={i} />
              {i < loan.installments.length - 1 && (
                <div className="border-t border-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Days past due warning */}
      {loan.daysPastDue > 0 && loan.status !== "repaid" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">
            This loan is <span className="font-bold">{loan.daysPastDue} days</span> past
            due. Please make a payment to avoid penalties.
          </p>
        </motion.div>
      )}

      {/* Repay CTA */}
      {(loan.status === "active" || loan.status === "in_arrears") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            onClick={() => setShowRepay(true)}
            className="h-14 w-full gap-2 text-base font-semibold"
          >
            <Wallet className="h-5 w-5" />
            Make Payment
          </Button>
        </motion.div>
      )}

      <RepaymentSheet
        open={showRepay}
        onClose={() => setShowRepay(false)}
        loan={loan}
      />
    </div>
  );
}
