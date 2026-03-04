"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLoanEligibility, useLoanHistory, useApplyLoan } from "@/hooks/use-loans";
import { useOverdraft, useOverdraftOptIn, useOverdraftOptOut, useOverdraftRepay } from "@/hooks/use-overdraft";
import { useTelegram } from "@/providers/TelegramProvider";
import type { LoanStatus, LoanSummary, OverdraftStatus } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const STATUS_CONFIG: Record<LoanStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  in_arrears: { label: "Late", className: "bg-warning/10 text-warning" },
  defaulted: { label: "Defaulted", className: "bg-destructive/10 text-destructive" },
  repaid: { label: "Repaid", className: "bg-success/10 text-success" },
  written_off: { label: "Written Off", className: "bg-muted text-muted-foreground" },
};

function TrustScoreGauge({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 70
      ? "text-success"
      : clampedScore >= 40
        ? "text-warning"
        : "text-destructive";

  return (
    <div className="relative flex h-36 w-36 items-center justify-center">
      <svg
        className="-rotate-90"
        width="136"
        height="136"
        viewBox="0 0 120 120"
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={color}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-bold font-tabular"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {clampedScore}
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Trust Score
        </span>
      </div>
    </div>
  );
}

function LoanApplicationSheet({
  open,
  onClose,
  maxCents,
}: {
  open: boolean;
  onClose: () => void;
  maxCents: number;
}) {
  const { haptic } = useTelegram();
  const apply = useApplyLoan();
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("30");
  const router = useRouter();

  const amountCents = Math.round(parseFloat(amount || "0") * 100);
  const valid = amountCents > 0 && amountCents <= maxCents && parseInt(days) > 0;

  async function handleApply() {
    if (!valid) return;
    try {
      const loan = await apply.mutateAsync({
        principalCents: amountCents,
        durationDays: parseInt(days),
      });
      haptic("heavy");
      onClose();
      router.push(`/loans/${loan.id}`);
    } catch {
      /* mutation error shown via toast */
    }
  }

  if (!open) return null;

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
            <h3 className="text-lg font-bold">Apply for Loan</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
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
                Max: {formatMoney(maxCents, "ETB")}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Duration (days)
              </label>
              <div className="flex gap-2">
                {["7", "14", "30", "60"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`flex-1 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                      days === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "bg-card text-muted-foreground"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              disabled={!valid || apply.isPending}
              onClick={handleApply}
              className="mt-4 h-14 w-full text-base font-semibold"
            >
              {apply.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm Application"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const OVERDRAFT_STATUS_LABEL: Record<OverdraftStatus, string> = {
  inactive: "Off",
  active: "On",
  used: "In use",
  suspended: "Suspended",
};

function OverdraftSection() {
  const { data: od, isLoading } = useOverdraft();
  const optIn = useOverdraftOptIn();
  const optOut = useOverdraftOptOut();
  const repay = useOverdraftRepay();
  const [showRepay, setShowRepay] = useState(false);
  const [repayAmount, setRepayAmount] = useState("");

  if (isLoading || !od) return null;

  const maxRepayCents = od.usedCents + od.accruedFeeCents;
  const repayCents = Math.round(parseFloat(repayAmount || "0") * 100);
  const canRepay = maxRepayCents > 0 && repayCents > 0 && repayCents <= maxRepayCents;
  const canOptOut = od.status !== "inactive" && od.usedCents === 0 && od.accruedFeeCents === 0;
  const canOptIn = od.status === "inactive" && od.limitCents > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="overflow-hidden rounded-2xl bg-muted dark:bg-card dark:border dark:border-border"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Overdraft</h3>
          <Badge variant="outline" className="text-xs">
            {OVERDRAFT_STATUS_LABEL[od.status]}
          </Badge>
        </div>
        {od.feeSummary && (
          <p className="mt-2 text-xs text-muted-foreground">{od.feeSummary}</p>
        )}
        {(od.status === "active" || od.status === "used") && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Limit </span>
              <span className="font-tabular font-medium">{formatMoney(od.limitCents, "ETB")}</span>
            </div>
            {od.status === "used" ? (
              <>
                <div>
                  <span className="text-muted-foreground">Used </span>
                  <span className="font-tabular font-medium">{formatMoney(od.usedCents, "ETB")}</span>
                </div>
                {od.accruedFeeCents > 0 && (
                  <div>
                    <span className="text-muted-foreground">Fees so far </span>
                    <span className="font-tabular font-medium">{formatMoney(od.accruedFeeCents, "ETB")}</span>
                  </div>
                )}
              </>
            ) : (
              <div>
                <span className="text-muted-foreground">Available </span>
                <span className="font-tabular font-medium">{formatMoney(od.availableCents, "ETB")}</span>
              </div>
            )}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {od.status === "used" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowRepay(true)}
              className="w-full"
            >
              Pay off overdraft
            </Button>
          )}
          {canOptOut && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => optOut.mutate()}
              disabled={optOut.isPending}
            >
              {optOut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn off overdraft"}
            </Button>
          )}
          {canOptIn && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => optIn.mutate()}
              disabled={optIn.isPending}
            >
              {optIn.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on overdraft"}
            </Button>
          )}
        </div>
      </div>

      {/* Repay sheet */}
      {showRepay && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowRepay(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Pay off overdraft</h3>
                <button
                  onClick={() => setShowRepay(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-2 text-sm text-muted-foreground">
                You owe {formatMoney(maxRepayCents, "ETB")} (used + fees).
              </p>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                className="h-12 mb-4"
              />
              <Button
                size="lg"
                disabled={!canRepay || repay.isPending}
                onClick={async () => {
                  if (!canRepay) return;
                  try {
                    await repay.mutateAsync({ amountCents: repayCents });
                    setShowRepay(false);
                    setRepayAmount("");
                  } catch {}
                }}
                className="w-full"
              >
                {repay.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Repay"}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function LoanRow({ loan }: { loan: LoanSummary }) {
  const status = STATUS_CONFIG[loan.status];

  return (
    <Link href={`/loans/${loan.id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-4 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4 transition-colors active:bg-muted/50"
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            loan.status === "repaid"
              ? "bg-success/10"
              : loan.status === "active"
                ? "bg-primary/10"
                : "bg-warning/10"
          }`}
        >
          {loan.status === "repaid" ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : loan.status === "active" ? (
            <Clock className="h-5 w-5 text-primary" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-warning" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {formatMoney(loan.principalAmountCents, "ETB")}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] ${status.className} border-0`}
            >
              {status.label}
            </Badge>
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {new Date(loan.disbursedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          {loan.status === "active" && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${loan.progressPct}%` }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {loan.progressPct}% repaid
              </p>
            </div>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </motion.div>
    </Link>
  );
}

export default function LoansPage() {
  const { haptic } = useTelegram();
  const eligibility = useLoanEligibility();
  const history = useLoanHistory();
  const [showApply, setShowApply] = useState(false);

  const isLoading = eligibility.isLoading || history.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex justify-center py-8">
          <Skeleton className="h-36 w-36 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const elig = eligibility.data;
  const hist = history.data;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Loans</h1>
      </div>

      {/* Eligibility card */}
      {elig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-muted dark:bg-card dark:border dark:border-border"
        >
          <div className="flex flex-col items-center gap-4 p-6">
            <TrustScoreGauge score={elig.trustScore} />

            <Link
              href="/loans/credit-score"
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
            >
              View Credit Score Details
              <ChevronRight className="h-3 w-3" />
            </Link>

            {elig.isEligible ? (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Available credit</p>
                <p className="mt-1 text-2xl font-bold font-tabular text-primary">
                  {elig.availableDisplay}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  of {elig.approvedLimitDisplay} approved limit
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Not eligible yet
                </p>
                {elig.reason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {elig.reason}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px border-t bg-border">
            <div className="flex flex-col items-center gap-1 bg-card py-4">
              <span className="text-xs text-muted-foreground">Outstanding</span>
              <span className="text-sm font-semibold font-tabular">
                {elig.outstandingDisplay}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-card py-4">
              <span className="text-xs text-muted-foreground">Repaid</span>
              <span className="text-sm font-semibold font-tabular">
                {elig.totalLoansRepaid}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-card py-4">
              <span className="text-xs text-muted-foreground">Fee</span>
              <span className="text-sm font-semibold font-tabular">
                {elig.facilitationFeePct}
              </span>
            </div>
          </div>

          {/* Apply CTA */}
          {elig.isEligible && (
            <div className="border-t p-4">
              <Button
                size="lg"
                onClick={() => {
                  haptic("medium");
                  setShowApply(true);
                }}
                className="h-14 w-full gap-2 text-base font-semibold"
              >
                <Wallet className="h-5 w-5" />
                Apply for Loan
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* Overdraft section */}
      <OverdraftSection />

      {/* History stats */}
      {hist && hist.stats && (
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Borrowed</p>
              <p className="text-sm font-bold font-tabular">
                {hist.stats.totalBorrowedDisplay}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Repaid</p>
              <p className="text-sm font-bold font-tabular">
                {hist.stats.totalRepaidDisplay}
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Loan history list */}
      <div>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Loan History
        </h2>

        {hist && hist.loans.length > 0 ? (
          <div className="space-y-3">
            {hist.loans.map((loan, i) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <LoanRow loan={loan} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No loans yet</p>
          </div>
        )}
      </div>

      {/* Apply sheet */}
      <LoanApplicationSheet
        open={showApply}
        onClose={() => setShowApply(false)}
        maxCents={elig?.availableCents ?? 0}
      />
    </div>
  );
}
