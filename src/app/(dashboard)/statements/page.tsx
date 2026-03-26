"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useStatements, useRequestStatement } from "@/hooks/use-statements";
import type { SupportedCurrency } from "@/lib/types";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  ready: "bg-success/10 text-success border-success/20",
  generating: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StatementsPage() {
  const { data: statements, isLoading } = useStatements();
  const requestStatement = useRequestStatement();

  const [showForm, setShowForm] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("ETB");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!fromDate || !toDate) return;

    try {
      await requestStatement.mutateAsync({
        fromDate,
        toDate,
        currency,
      });
      toast.success("Statement requested");
      setShowForm(false);
      setFromDate("");
      setToDate("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to request statement",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statements"
        backHref="/"
        rightSlot={
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" /> Request
          </Button>
        }
      />

      {/* Request form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleRequest}
          className="space-y-4 rounded-2xl border border-border/60 bg-card p-4"
        >
          <p className="text-sm font-semibold">Request Statement</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                From
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                To
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Currency
            </label>
            <div className="flex gap-2">
              {["ETB", "USD", "GBP", "EUR"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c as SupportedCurrency)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    currency === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card text-muted-foreground hover:bg-primary/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!fromDate || !toDate || requestStatement.isPending}
            >
              {requestStatement.isPending ? "Requesting..." : "Request"}
            </Button>
          </div>
        </motion.form>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!statements || statements.length === 0) && (
        <EmptyState
          icon={FileText}
          title="No statements yet"
          description="Request a statement to download your transaction history."
          actionLabel="Request Statement"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Statements list */}
      {!isLoading && statements && statements.length > 0 && (
        <div className="space-y-3">
          {statements.map((statement, i) => (
            <motion.div
              key={statement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {statement.currency} Statement
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_STYLES[statement.status] ?? ""}`}
                  >
                    {statement.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {formatDate(statement.dateFrom)} &ndash;{" "}
                  {formatDate(statement.dateTo)}
                </p>
              </div>
              {statement.status === "ready" && statement.downloadUrl && (
                <a
                  href={statement.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                >
                  <Download className="h-4 w-4" />
                </a>
              )}
              {statement.status === "generating" && (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
