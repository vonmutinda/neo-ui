"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreditScore, useCreditScoreHistory } from "@/hooks/use-loans";

export default function CreditScorePage() {
  const score = useCreditScore();
  const history = useCreditScoreHistory();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Credit score" backHref="/loans" />

      {score.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      )}

      {score.data && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trust score
          </p>
          <p className="mt-2 font-tabular text-5xl font-semibold text-foreground">
            {score.data.trustScore}
            <span className="text-2xl text-muted-foreground">
              /{score.data.maxScore}
            </span>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs text-muted-foreground">
            <p>Cash flow: {score.data.cashFlowPoints}</p>
            <p>Stability: {score.data.stabilityPoints}</p>
            <p>Base: {score.data.basePoints}</p>
            <p>Penalties: {score.data.penaltyPoints}</p>
          </div>
          {score.data.tips?.length > 0 && (
            <ul className="mt-4 space-y-1 text-left text-xs text-foreground/80">
              {score.data.tips.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">History</h2>
        {history.isLoading && <Skeleton className="h-32 w-full rounded-xl" />}
        {history.data?.history?.length === 0 && (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        )}
        <ul className="space-y-2">
          {(history.data?.history ?? []).map((h) => (
            <li
              key={h.month}
              className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{h.month}</span>
              <span className="font-tabular font-semibold">{h.score}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/loans/apply"
        className="text-center text-sm font-medium text-primary"
      >
        Apply for a loan
      </Link>
    </div>
  );
}
