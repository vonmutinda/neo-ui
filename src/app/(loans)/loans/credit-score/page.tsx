"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Lightbulb } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreditScore, useCreditScoreHistory } from "@/hooks/use-loans";

function CreditScoreGauge({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 70
      ? "text-success"
      : pct >= 40
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
          {score}
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          of {max}
        </span>
      </div>
    </div>
  );
}

function ScoreHistoryChart({
  history,
}: {
  history: { month: string; score: number }[];
}) {
  if (history.length === 0) return null;

  const minScore = 300;
  const maxScore = 1000;
  const range = maxScore - minScore;

  const padding = { top: 10, bottom: 24, left: 0, right: 0 };
  const chartW = 300;
  const chartH = 120;
  const plotW = chartW - padding.left - padding.right;
  const plotH = chartH - padding.top - padding.bottom;

  const points = history.map((entry, i) => {
    const x =
      padding.left +
      (history.length === 1 ? plotW / 2 : (i / (history.length - 1)) * plotW);
    const y =
      padding.top + plotH - ((entry.score - minScore) / range) * plotH;
    return { x, y, ...entry };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const last = points[points.length - 1];

  return (
    <div className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Score History
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
            r={i === points.length - 1 ? 5 : 3}
            fill={i === points.length - 1 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          />
        ))}
        {points.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={chartH - 4}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            {p.month}
          </text>
        ))}
        {last && (
          <text
            x={last.x}
            y={last.y - 10}
            textAnchor="middle"
            className="fill-foreground text-[10px] font-semibold"
          >
            {last.score}
          </text>
        )}
      </svg>
    </div>
  );
}

function BreakdownBar({
  label,
  points,
  maxPoints,
  color,
  delay,
}: {
  label: string;
  points: number;
  maxPoints: number;
  color: string;
  delay: number;
}) {
  const pct = Math.min(100, Math.max(0, (points / maxPoints) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold font-tabular">{points}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut", delay }}
        />
      </div>
    </div>
  );
}

export default function CreditScorePage() {
  const score = useCreditScore();
  const history = useCreditScoreHistory();

  const isLoading = score.isLoading || history.isLoading;

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
        <Skeleton className="h-32 rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const data = score.data;
  const historyData = history.data?.history ?? [];

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
        <h1 className="text-xl font-semibold">Credit Score</h1>
      </div>

      {/* Score gauge */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-8"
        >
          <CreditScoreGauge score={data.trustScore} max={data.maxScore} />
          <p className="text-xs text-muted-foreground">
            {data.trustScore >= 700
              ? "Excellent"
              : data.trustScore >= 500
                ? "Good"
                : data.trustScore >= 300
                  ? "Fair"
                  : "Needs Improvement"}
          </p>
        </motion.div>
      )}

      {/* Score history chart */}
      {historyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ScoreHistoryChart history={historyData} />
        </motion.div>
      )}

      {/* Score breakdown */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4 space-y-4"
        >
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Score Breakdown
          </h3>
          <BreakdownBar
            label="Cash Flow"
            points={data.cashFlowPoints}
            maxPoints={400}
            color="bg-primary"
            delay={0.2}
          />
          <BreakdownBar
            label="Stability"
            points={data.stabilityPoints}
            maxPoints={200}
            color="bg-success"
            delay={0.3}
          />
          <BreakdownBar
            label="Penalties"
            points={data.penaltyPoints}
            maxPoints={100}
            color="bg-destructive"
            delay={0.4}
          />
          <BreakdownBar
            label="Base"
            points={data.basePoints}
            maxPoints={300}
            color="bg-muted-foreground"
            delay={0.5}
          />
        </motion.div>
      )}

      {/* Tips */}
      {data && data.tips.length > 0 && (
        <div>
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Tips to Improve
          </h3>
          <div className="space-y-2">
            {data.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + 0.05 * i }}
                className="flex items-start gap-3 rounded-xl bg-muted dark:bg-card dark:border dark:border-border p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/10">
                  <Lightbulb className="h-4 w-4 text-warning" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
