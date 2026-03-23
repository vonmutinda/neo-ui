"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SuccessAnimation } from "@/components/shared/SuccessAnimation";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useLoanEligibility,
  useLoanHistory,
  useApplyLoan,
  useLoanDetail,
  useRepayLoan,
  useCreditScore,
  useCreditScoreHistory,
} from "@/hooks/use-loans";
import { useWalletSummary } from "@/hooks/use-wallets";
import {
  useOverdraft,
  useOverdraftOptIn,
  useOverdraftOptOut,
  useOverdraftRepay,
} from "@/hooks/use-overdraft";

import type {
  LoanStatus,
  LoanSummary,
  LoanEligibility,
  LoanInstallment,
  OverdraftStatus,
} from "@/lib/types";
import { formatMoney } from "@/lib/format";
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

/* ─── Constants ─── */

const MIN_LOAN_CENTS = 50000;
const DURATION_OPTIONS = ["7", "14", "30", "60"];

const STATUS_LABEL: Record<LoanStatus, string> = {
  active: "Active",
  in_arrears: "Late",
  defaulted: "Defaulted",
  repaid: "Repaid",
  written_off: "Written off",
};

const OVERDRAFT_STATUS_LABEL: Record<OverdraftStatus, string> = {
  inactive: "Off",
  active: "On",
  used: "In use",
  suspended: "Suspended",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

/* ─── Credit Score Panel ─── */

function CreditScoreGauge({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  const rating =
    score >= 700
      ? "Excellent"
      : score >= 500
        ? "Good"
        : score >= 300
          ? "Fair"
          : "Needs improvement";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="-rotate-90 h-24 w-24" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-primary/20"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="text-primary"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-tabular text-xl font-semibold tabular-nums text-primary">
            {score}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            of {max}
          </span>
        </div>
      </div>
      <span className="text-xs font-medium text-foreground">{rating}</span>
    </div>
  );
}

function BreakdownBar({
  label,
  points,
  maxPoints,
}: {
  label: string;
  points: number;
  maxPoints: number;
}) {
  const pct = Math.min(100, Math.max(0, (points / maxPoints) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-foreground/70">{label}</span>
        <span className="font-tabular font-medium tabular-nums text-foreground">
          {points}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
}

function ScoreHistorySparkline({
  history,
}: {
  history: { month: string; score: number }[];
}) {
  if (history.length === 0) return null;

  const minScore = 300;
  const maxScore = 1000;
  const range = maxScore - minScore;
  const padding = { top: 8, bottom: 20, left: 0, right: 0 };
  const chartW = 280;
  const chartH = 80;
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;

  const points = history.map((entry, i) => {
    const x =
      padding.left +
      (history.length === 1 ? plotW / 2 : (i / (history.length - 1)) * plotW);
    const y = padding.top + plotH - ((entry.score - minScore) / range) * plotH;
    return { x, y, ...entry };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Score history
      </h3>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full text-primary"
        preserveAspectRatio="xMidYMid meet"
      >
        <polyline
          points={polyline}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 3 : 2}
            fill={i === points.length - 1 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={chartH - 2}
            textAnchor="middle"
            className="fill-muted-foreground text-[8px]"
          >
            {p.month}
          </text>
        ))}
        {last && (
          <text
            x={last.x}
            y={last.y - 8}
            textAnchor="middle"
            className="fill-foreground text-[9px] font-medium"
          >
            {last.score}
          </text>
        )}
      </svg>
    </div>
  );
}

function CreditScorePanel() {
  const score = useCreditScore();
  const history = useCreditScoreHistory();
  const isLoading = score.isLoading || history.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4">
        <Skeleton className="mx-auto h-24 w-24 rounded-full" />
        <Skeleton className="h-16" />
        <Skeleton className="h-12" />
      </div>
    );
  }

  const data = score.data;
  const historyData = history.data?.history ?? [];
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-5 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/6 via-card to-accent/4 p-5"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Credit score
      </h2>

      <CreditScoreGauge score={data.trustScore} max={data.maxScore} />

      <div className="space-y-3">
        <BreakdownBar
          label="Cash flow"
          points={data.cashFlowPoints}
          maxPoints={400}
        />
        <BreakdownBar
          label="Stability"
          points={data.stabilityPoints}
          maxPoints={200}
        />
        <BreakdownBar
          label="Penalties"
          points={data.penaltyPoints}
          maxPoints={100}
        />
        <BreakdownBar label="Base" points={data.basePoints} maxPoints={300} />
      </div>

      {historyData.length > 0 && (
        <ScoreHistorySparkline history={historyData} />
      )}

      {data.tips.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tips to improve
          </h3>
          <ul className="space-y-1.5">
            {data.tips.map((tip, i) => (
              <li key={i} className="text-xs text-foreground/80">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Trust Score Bar (inline, no link) ─── */

function TrustScoreBar({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Trust score
        </span>
        <span className="font-tabular text-sm font-medium tabular-nums text-foreground">
          {clamped}
        </span>
      </div>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-primary/20">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Borrow Hero (no active loan) ─── */

type ApplyStep = "form" | "preview" | "success";

function BorrowHero({
  elig,
  onApplied,
}: {
  elig: LoanEligibility;
  onApplied: () => void;
}) {
  const [step, setStep] = useState<ApplyStep>("form");
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("30");
  const [showSuccess, setShowSuccess] = useState(false);

  const apply = useApplyLoan();

  const canApply = elig.isEligible && elig.availableCents >= MIN_LOAN_CENTS;
  const amountCents = Math.round(
    parseFloat(String(amount || "0").replace(/,/g, "")) * 100,
  );
  const isValid =
    canApply &&
    amountCents >= MIN_LOAN_CENTS &&
    amountCents <= elig.availableCents &&
    parseInt(days, 10) > 0;

  const estFeeCents = Math.round(
    amountCents * (parseFloat(String(elig.facilitationFeePct)) / 100),
  );
  const estTotalDue = amountCents + estFeeCents;
  const estInstallments = Math.max(1, Math.ceil(parseInt(days, 10) / 7));

  async function handleConfirm() {
    if (!isValid || apply.isPending) return;
    try {
      await apply.mutateAsync({
        principalCents: amountCents,
        durationDays: parseInt(days, 10),
      });
      setShowSuccess(true);
      setStep("success");
    } catch {
      /* toast in hook */
    }
  }

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
      onApplied();
    }, 1800);
    return () => clearTimeout(timer);
  }, [showSuccess, onApplied]);

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        title="Loan approved"
        subtitle={`${formatMoney(amountCents, "ETB")} disbursed to your wallet`}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-border/40 bg-gradient-to-br from-emerald-500/8 via-card to-primary/6"
      >
        <div className="p-5">
          {elig.isEligible ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Available credit
              </p>
              <span className="mt-1 block font-tabular text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {formatMoney(elig.availableCents, "ETB")}
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                of {formatMoney(elig.approvedLimitCents, "ETB")} limit
              </p>
              <div className="mt-4">
                <TrustScoreBar score={elig.trustScore} />
              </div>
            </>
          ) : (
            <div className="py-2">
              <p className="text-sm font-medium text-foreground">
                Not eligible yet
              </p>
              {elig.reason && (
                <p className="mt-1 text-xs text-foreground/80">{elig.reason}</p>
              )}
              <div className="mt-4">
                <TrustScoreBar score={elig.trustScore} />
              </div>
            </div>
          )}
        </div>

        {canApply && (
          <div className="border-t border-border/60 p-5">
            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.div key="form" {...fadeSlide} className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Apply for a loan
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount (ETB)
                    </label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-11 rounded-xl border border-border/60 bg-card font-mono text-lg text-foreground"
                    />
                    <p className="mt-1 text-xs text-foreground/80">
                      Min {formatMoney(MIN_LOAN_CENTS, "ETB")} · Max{" "}
                      {formatMoney(elig.availableCents, "ETB")}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {DURATION_OPTIONS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(d)}
                          className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            days === d
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 bg-card text-foreground/70 hover:bg-primary/5 hover:border-primary/40"
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="cta"
                    disabled={!isValid}
                    onClick={() => setStep("preview")}
                  >
                    Get loan
                  </Button>
                </motion.div>
              )}

              {step === "preview" && (
                <motion.div key="preview" {...fadeSlide} className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm loan
                  </p>
                  <div className="space-y-3 rounded-xl border border-border/60 bg-background p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Amount</span>
                      <span className="font-tabular font-medium tabular-nums text-foreground">
                        {formatMoney(amountCents, "ETB")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Term</span>
                      <span className="font-tabular font-medium tabular-nums text-foreground">
                        {days} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">
                        Est. fee ({elig.facilitationFeePct}%)
                      </span>
                      <span className="font-tabular font-medium tabular-nums text-foreground">
                        {formatMoney(estFeeCents, "ETB")}
                      </span>
                    </div>
                    <div className="border-t border-border/60 pt-3 flex justify-between text-sm font-medium">
                      <span className="text-foreground">Total due</span>
                      <span className="font-tabular tabular-nums text-foreground">
                        {formatMoney(estTotalDue, "ETB")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-foreground/70">
                      <span>Installments</span>
                      <span className="font-tabular tabular-nums">
                        ~{estInstallments} weekly
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground/70">
                    Funds will be disbursed to your ETB wallet. Repay on time to
                    keep your trust score healthy.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="flex-1 rounded-xl border border-border/60 bg-card py-2.5 text-sm font-medium text-foreground/80 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Back
                    </button>
                    <Button
                      type="button"
                      size="cta"
                      disabled={apply.isPending}
                      onClick={handleConfirm}
                      className="flex-1"
                    >
                      {apply.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          Processing…
                        </span>
                      ) : (
                        "Confirm & apply"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {elig.isEligible && !canApply && elig.availableCents > 0 && (
          <div className="border-t border-border/60 p-5">
            <p className="text-xs text-foreground/80">
              Minimum loan is {formatMoney(MIN_LOAN_CENTS, "ETB")}. Your
              available credit is below that.
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}

/* ─── Active Loan Hero ─── */

function InstallmentRow({ installment }: { installment: LoanInstallment }) {
  const isPast =
    new Date(installment.dueDate) < new Date() && !installment.isPaid;
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-3 last:border-0">
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

function ActiveLoanHero({ loan }: { loan: LoanSummary }) {
  const { data: detail, isLoading: detailLoading } = useLoanDetail(loan.id);
  const repay = useRepayLoan();
  const wallet = useWalletSummary();
  const [installmentsExpanded, setInstallmentsExpanded] = useState(false);
  const [repayMode, setRepayMode] = useState<"idle" | "custom">("idle");
  const [customAmount, setCustomAmount] = useState("");
  const [confirmPayCents, setConfirmPayCents] = useState<number | null>(null);

  const isLate = loan.status === "in_arrears";
  const daysUntilDue = Math.max(
    0,
    // eslint-disable-next-line react-hooks/purity -- Date.now() needed to compute days remaining
    Math.ceil((new Date(loan.dueDate).getTime() - Date.now()) / 86400000),
  );

  const remainingCents = loan.totalDueCents - loan.totalPaidCents;
  const nextUnpaid = detail?.installments.find((i) => !i.isPaid);
  const nextInstallmentCents = nextUnpaid?.amountDueCents ?? remainingCents;
  const paidCount = detail?.installments.filter((i) => i.isPaid).length ?? 0;
  const totalCount = detail?.installments.length ?? 0;
  const etbBalance = wallet.data?.balances.find((b) => b.currency === "ETB");

  const customCents = Math.round(
    parseFloat(String(customAmount || "0").replace(/,/g, "")) * 100,
  );
  const customValid = customCents > 0 && customCents <= remainingCents;

  async function handlePay(amountCents: number) {
    if (repay.isPending) return;
    try {
      await repay.mutateAsync({ id: loan.id, amountCents });
      setRepayMode("idle");
      setCustomAmount("");
    } catch {
      /* toast in hook */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/8 via-card to-accent/6"
    >
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {STATUS_LABEL[loan.status]}
          </span>
          <span className="text-xs font-medium text-foreground">
            {isLate ? `${loan.daysPastDue}d overdue` : `${daysUntilDue}d left`}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Remaining
          </p>
          <span className="mt-0.5 block font-tabular text-3xl font-bold tabular-nums tracking-tight text-foreground">
            {formatMoney(remainingCents, "ETB")}
          </span>
          <p className="mt-0.5 text-xs text-foreground/80">
            of {formatMoney(loan.totalDueCents, "ETB")} total
          </p>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-foreground/80">
            <span>{loan.progressPct}% repaid</span>
            <span className="font-tabular tabular-nums">
              {formatMoney(loan.totalPaidCents, "ETB")} paid
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${loan.progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Quick-pay buttons */}
        {(loan.status === "active" || loan.status === "in_arrears") && (
          <div className="mt-5 space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                disabled={repay.isPending}
                onClick={() => setConfirmPayCents(nextInstallmentCents)}
                className="flex-1 rounded-xl border border-primary bg-primary/10 py-2.5 px-3 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="block text-xs uppercase tracking-widest text-primary/80">
                  Pay next
                </span>
                <span className="font-tabular">
                  {formatMoney(nextInstallmentCents, "ETB")}
                </span>
              </button>
              <button
                type="button"
                disabled={repay.isPending}
                onClick={() => setConfirmPayCents(remainingCents)}
                className="flex-1 rounded-xl border border-border/60 py-2.5 px-3 text-left text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/5 hover:border-primary/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="block text-xs uppercase tracking-widest text-foreground/60">
                  Pay full
                </span>
                <span className="font-tabular tabular-nums">
                  {formatMoney(remainingCents, "ETB")}
                </span>
              </button>
            </div>

            {repayMode === "idle" ? (
              <button
                type="button"
                onClick={() => setRepayMode("custom")}
                className="text-xs font-medium text-primary/80 hover:text-primary transition-colors"
              >
                Custom amount
              </button>
            ) : (
              <AnimatePresence>
                <motion.div
                  key="custom-repay"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-1">
                    {etbBalance && (
                      <div className="flex justify-between text-xs text-foreground/70">
                        <span>Wallet balance</span>
                        <span className="font-tabular tabular-nums">
                          {etbBalance.display}
                        </span>
                      </div>
                    )}
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || parseFloat(v) >= 0) setCustomAmount(v);
                      }}
                      min="0"
                      className="h-11 rounded-xl border border-border/60 bg-card font-mono text-foreground"
                    />
                    <p className="text-xs text-foreground/70">
                      Remaining: {formatMoney(remainingCents, "ETB")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRepayMode("idle");
                          setCustomAmount("");
                        }}
                        className="flex-1 rounded-xl border border-border/60 py-2.5 text-sm font-medium text-foreground hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!customValid || repay.isPending}
                        onClick={() => setConfirmPayCents(customCents)}
                        className="flex-1 rounded-xl border border-primary bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      >
                        {repay.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : (
                          "Confirm"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {repay.isPending && repayMode === "idle" && (
              <div className="flex items-center gap-2 text-xs text-primary/80">
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing payment…
              </div>
            )}
          </div>
        )}
      </div>

      {isLate && (
        <div className="border-t border-border/60 bg-muted/50 px-5 py-2.5">
          <p className="text-xs text-foreground/90">
            Overdue by {loan.daysPastDue} days. Pay now to avoid penalties.
          </p>
        </div>
      )}

      {/* Collapsible installments */}
      {detail && totalCount > 0 && (
        <div className="border-t border-border/60">
          <button
            type="button"
            onClick={() => setInstallmentsExpanded(!installmentsExpanded)}
            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-primary/5 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Installments · {paidCount} of {totalCount} paid
            </span>
            <motion.span
              animate={{ rotate: installmentsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-foreground/60" />
            </motion.span>
          </button>

          <AnimatePresence>
            {installmentsExpanded && (
              <motion.div
                key="installments"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-4">
                  {detail.installments.map((inst) => (
                    <InstallmentRow
                      key={inst.installmentNumber}
                      installment={inst}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {detailLoading && (
        <div className="border-t border-border/60 px-5 py-4">
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      <AlertDialog
        open={confirmPayCents !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmPayCents(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm loan payment</AlertDialogTitle>
            <AlertDialogDescription>
              Pay{" "}
              {confirmPayCents !== null
                ? formatMoney(confirmPayCents, "ETB")
                : ""}{" "}
              towards your loan? This amount will be deducted from your ETB
              wallet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmPayCents !== null) {
                  handlePay(confirmPayCents);
                  setConfirmPayCents(null);
                }
              }}
            >
              Confirm payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/* ─── Overdraft Card ─── */

type OverdraftRepayStep = "amount" | "preview";

function OverdraftCard() {
  const { data: od, isLoading } = useOverdraft();
  const optIn = useOverdraftOptIn();
  const optOut = useOverdraftOptOut();
  const repay = useOverdraftRepay();
  const [repayStep, setRepayStep] = useState<OverdraftRepayStep | null>(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [showOptOutConfirm, setShowOptOutConfirm] = useState(false);

  if (isLoading || !od) return null;

  const maxRepayCents = od.usedCents + od.accruedFeeCents;
  const repayCents = Math.round(
    parseFloat(String(repayAmount || "0").replace(/,/g, "")) * 100,
  );
  const canProceed =
    maxRepayCents > 0 && repayCents > 0 && repayCents <= maxRepayCents;
  const canOptOut =
    od.status !== "inactive" && od.usedCents === 0 && od.accruedFeeCents === 0;
  const canOptIn = od.status === "inactive" && od.limitCents > 0;

  async function handleConfirmRepay() {
    if (!canProceed || repay.isPending) return;
    try {
      await repay.mutateAsync({ amountCents: repayCents });
      setRepayStep(null);
      setRepayAmount("");
    } catch {
      /* toast in hook */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-warning/6 via-card to-primary/4"
    >
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overdraft
          </h2>
          <span className="text-xs font-medium text-foreground">
            {OVERDRAFT_STATUS_LABEL[od.status]}
          </span>
        </div>

        {od.feeSummary && (
          <p className="mt-2 text-xs text-foreground/80">{od.feeSummary}</p>
        )}

        {(od.status === "active" || od.status === "used") && (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/70">Limit</span>
              <span className="font-tabular font-medium tabular-nums text-foreground">
                {formatMoney(od.limitCents, "ETB")}
              </span>
            </div>
            {od.status === "used" ? (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Used</span>
                  <span className="font-tabular font-medium tabular-nums text-foreground">
                    {formatMoney(od.usedCents, "ETB")}
                  </span>
                </div>
                {od.accruedFeeCents > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Fees</span>
                    <span className="font-tabular font-medium tabular-nums text-foreground">
                      {formatMoney(od.accruedFeeCents, "ETB")}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-foreground/70">Available</span>
                <span className="font-tabular font-medium tabular-nums text-foreground">
                  {formatMoney(od.availableCents, "ETB")}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {od.status === "used" && repayStep === null && (
            <button
              type="button"
              onClick={() => setRepayStep("amount")}
              className="rounded-xl border border-primary bg-primary/10 px-3 py-2 text-xs font-medium uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Pay off
            </button>
          )}
          {canOptOut && repayStep === null && (
            <button
              type="button"
              onClick={() => setShowOptOutConfirm(true)}
              disabled={optOut.isPending}
              className="rounded-xl border border-border/60 bg-transparent px-3 py-2 text-xs font-medium uppercase tracking-widest text-foreground/80 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {optOut.isPending ? "…" : "Turn off"}
            </button>
          )}
          {canOptIn && repayStep === null && (
            <button
              type="button"
              onClick={() => optIn.mutate()}
              disabled={optIn.isPending}
              className="rounded-xl border border-border/60 bg-transparent px-3 py-2 text-xs font-medium uppercase tracking-widest text-foreground/80 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {optIn.isPending ? "…" : "Turn on"}
            </button>
          )}
        </div>
      </div>

      {/* Repay flow */}
      <AnimatePresence>
        {repayStep === "amount" && (
          <motion.div
            key="od-amount"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-muted/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Repayment amount
              </p>
              <p className="mt-1 text-xs text-foreground/80">
                Total due: {formatMoney(maxRepayCents, "ETB")} (used + fees)
              </p>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || parseFloat(v) >= 0) setRepayAmount(v);
                }}
                className="mt-3 h-11 rounded-xl border border-border/60 bg-card font-mono text-foreground"
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRepayStep(null);
                    setRepayAmount("");
                  }}
                  className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium uppercase tracking-widest text-foreground/80 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setRepayStep("preview")}
                  className="rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {repayStep === "preview" && (
          <motion.div
            key="od-preview"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 bg-muted/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preview & confirm
              </p>
              <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-card p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Amount to pay</span>
                  <span className="font-tabular font-medium tabular-nums text-foreground">
                    {formatMoney(repayCents, "ETB")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">
                    Total overdraft due
                  </span>
                  <span className="font-tabular font-medium tabular-nums text-foreground">
                    {formatMoney(maxRepayCents, "ETB")}
                  </span>
                </div>
                {od.usedCents > 0 && (
                  <div className="flex justify-between text-xs text-foreground/70">
                    <span>Principal (used)</span>
                    <span className="font-tabular tabular-nums">
                      {formatMoney(od.usedCents, "ETB")}
                    </span>
                  </div>
                )}
                {od.accruedFeeCents > 0 && (
                  <div className="flex justify-between text-xs text-foreground/70">
                    <span>Fees</span>
                    <span className="font-tabular tabular-nums">
                      {formatMoney(od.accruedFeeCents, "ETB")}
                    </span>
                  </div>
                )}
              </div>
              {od.feeSummary && (
                <p className="mt-3 text-xs text-foreground/70">
                  {od.feeSummary}
                </p>
              )}
              <p className="mt-2 text-xs text-foreground/80">
                This amount will be deducted from your ETB balance.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setRepayStep("amount")}
                  className="rounded-xl border border-border/60 bg-card px-3 py-2 text-xs font-medium uppercase tracking-widest text-foreground/80 hover:bg-primary/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={repay.isPending}
                  onClick={handleConfirmRepay}
                  className="flex-1 rounded-xl border border-primary bg-primary px-3 py-2 text-xs font-medium uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {repay.isPending ? "Processing…" : "Confirm repayment"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={showOptOutConfirm} onOpenChange={setShowOptOutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off overdraft?</AlertDialogTitle>
            <AlertDialogDescription>
              You will no longer have access to overdraft protection. You can
              turn it back on later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                optOut.mutate();
                setShowOptOutConfirm(false);
              }}
            >
              Turn off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

/* ─── Past Loans ─── */

function PastLoanRow({ loan }: { loan: LoanSummary }) {
  return (
    <Link
      href={`/loans/${loan.id}`}
      className="flex items-center justify-between border-b border-border/60 py-4 last:border-0 hover:bg-primary/5 transition-colors"
    >
      <div>
        <p className="font-tabular text-sm font-medium tabular-nums text-foreground">
          {formatMoney(loan.principalAmountCents, "ETB")}
        </p>
        <p className="text-xs text-foreground/70">
          {new Date(loan.disbursedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {STATUS_LABEL[loan.status]}
      </span>
    </Link>
  );
}

function PastLoansSection({ loans }: { loans: LoanSummary[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Past loans
      </h2>
      {loans.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No past loans"
          description="Your loan history will appear here after you borrow and repay."
        />
      ) : (
        <div className="rounded-2xl border border-border/40 bg-card px-5">
          {loans.map((loan) => (
            <PastLoanRow key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Quick Stats Row ─── */

function QuickStatsRow({ elig }: { elig: LoanEligibility }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border/40 bg-card"
    >
      <div className="border-r border-border/40 bg-gradient-to-b from-success/6 to-transparent py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Repaid
        </p>
        <p className="mt-1 font-tabular text-lg font-bold tabular-nums text-foreground">
          {elig.totalLoansRepaid}
        </p>
      </div>
      <div className="border-r border-border/40 bg-gradient-to-b from-warning/6 to-transparent py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Late
        </p>
        <p className="mt-1 font-tabular text-lg font-bold tabular-nums text-foreground">
          {elig.latePaymentsCount}
        </p>
      </div>
      <div className="bg-gradient-to-b from-primary/6 to-transparent py-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fee %
        </p>
        <p className="mt-1 font-tabular text-lg font-bold tabular-nums text-foreground">
          {elig.facilitationFeePct}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */

export default function LoansPage() {
  const eligibility = useLoanEligibility();
  const history = useLoanHistory();
  const isLoading = eligibility.isLoading || history.isLoading;

  const elig = eligibility.data;
  const hist = history.data;
  const activeLoan = hist?.loans.find(
    (l) => l.status === "active" || l.status === "in_arrears",
  );
  const hasActiveLoan = !!activeLoan;
  const pastLoans =
    hist?.loans.filter((l) =>
      ["repaid", "written_off", "defaulted"].includes(l.status),
    ) ?? [];

  const handleApplied = useCallback(() => {
    // Query invalidation in the hook will cause activeLoan to appear,
    // switching the hero from BorrowHero to ActiveLoanHero automatically.
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <PageHeader title="Loans" />

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Left column */}
        <div className="space-y-6 lg:col-start-1">
          {/* Mutually exclusive hero */}
          <AnimatePresence mode="wait">
            {hasActiveLoan ? (
              <motion.div key="active" {...fadeSlide}>
                <ActiveLoanHero loan={activeLoan} />
              </motion.div>
            ) : elig ? (
              <motion.div key="borrow" {...fadeSlide}>
                <BorrowHero elig={elig} onApplied={handleApplied} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {elig && !hasActiveLoan && <QuickStatsRow elig={elig} />}

          <OverdraftCard />

          {/* Credit score on mobile only */}
          <div className="lg:hidden">
            <CreditScorePanel />
          </div>

          <PastLoansSection loans={pastLoans} />
        </div>

        {/* Right column — credit score (desktop only, sticky) */}
        <div className="hidden lg:block lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
          <CreditScorePanel />
        </div>
      </div>
    </div>
  );
}
