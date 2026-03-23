"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePot,
  useAddToPot,
  useWithdrawFromPot,
  useArchivePot,
} from "@/hooks/use-pots";
import { usePotTransactions } from "@/hooks/use-pot-transactions";

import { toast } from "sonner";
import type { Transaction } from "@/lib/types";
import { formatMoney } from "@/lib/format";

type TransferMode = "add" | "withdraw" | null;

export default function PotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: pot, isLoading } = usePot(id);
  const { data: potTxs, isLoading: txsLoading } = usePotTransactions(id);
  const addToPot = useAddToPot();
  const withdrawFromPot = useWithdrawFromPot();
  const archivePot = useArchivePot();

  const [mode, setMode] = useState<TransferMode>(null);
  const [amount, setAmount] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4 pt-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-20 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!pot) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-muted-foreground">Pot not found</p>
        <Link href="/" className="text-sm font-medium text-primary">
          Go to dashboard
        </Link>
      </div>
    );
  }

  const progress = pot.targetCents
    ? Math.min((pot.balanceCents / pot.targetCents) * 100, 100)
    : 0;

  async function handleTransfer() {
    if (!mode || !amount || !id) return;
    const cents = Math.round(parseFloat(amount) * 100);
    if (cents <= 0) return;

    try {
      if (mode === "add") {
        await addToPot.mutateAsync({ id, amountCents: cents });
      } else {
        await withdrawFromPot.mutateAsync({ id, amountCents: cents });
      }
      setMode(null);
      setAmount("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Transfer failed");
    }
  }

  async function handleDelete() {
    if (!id) return;
    try {
      await archivePot.mutateAsync(id);
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete pot");
    }
  }

  const isPending = addToPot.isPending || withdrawFromPot.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={pot.name}
        backHref="/"
        rightSlot={
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />

      {/* Balance card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Current balance
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums">
          {formatMoney(pot.balanceCents, pot.currencyCode)}
        </p>

        {pot.targetCents != null && pot.targetCents > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-background/50">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progress.toFixed(1)}% saved</span>
              <span>
                Target: {formatMoney(pot.targetCents, pot.currencyCode)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Transfer buttons */}
      <div className="flex gap-3">
        <Button
          variant={mode === "add" ? "default" : "outline"}
          size="lg"
          className={`h-12 flex-1 gap-2 rounded-xl ${mode === "add" ? "border border-primary bg-primary text-primary-foreground hover:opacity-90" : "border border-primary text-primary hover:bg-primary/10"}`}
          onClick={() => {
            setMode(mode === "add" ? null : "add");
            setAmount("");
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
        <Button
          variant={mode === "withdraw" ? "default" : "outline"}
          size="lg"
          className={`h-12 flex-1 gap-2 rounded-xl ${mode === "withdraw" ? "border border-primary bg-primary text-primary-foreground hover:opacity-90" : "border border-primary text-primary hover:bg-primary/10"}`}
          onClick={() => {
            setMode(mode === "withdraw" ? null : "withdraw");
            setAmount("");
          }}
        >
          <Minus className="h-4 w-4" /> Withdraw
        </Button>
      </div>

      {/* Transfer form */}
      <AnimatePresence>
        {mode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Amount ({pot.currencyCode})
              </label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                placeholder="0.00"
                className="text-lg font-semibold tabular-nums"
              />
            </div>
            <Button
              size="cta"
              onClick={handleTransfer}
              disabled={!amount || parseFloat(amount) <= 0 || isPending}
            >
              {isPending
                ? "Processing..."
                : mode === "add"
                  ? `Add to ${pot.name}`
                  : `Withdraw from ${pot.name}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transactions */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-muted-foreground">
          Transactions
        </h2>
        {txsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : potTxs && potTxs.length > 0 ? (
          <div className="space-y-0.5 overflow-hidden rounded-2xl border border-border/60 bg-card">
            {potTxs.map((tx: Transaction, i: number) => {
              const isAdd = tx.isCredit;
              const asset = tx.asset
                ? tx.asset.split("/")[0]
                : pot.currencyCode;
              return (
                <div
                  key={tx.id ? `${tx.id}-${i}` : `pot-tx-${i}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors active:bg-muted"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isAdd
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isAdd ? (
                      <ArrowDown className="h-5 w-5" />
                    ) : (
                      <ArrowUp className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {isAdd ? "Added funds" : "Withdrew funds"}
                    </p>
                    <p className="text-xs text-muted-foreground">{asset}</p>
                  </div>
                  <span
                    className={`whitespace-nowrap font-tabular text-sm font-semibold ${
                      isAdd ? "text-success" : "text-foreground"
                    }`}
                  >
                    {formatMoney(
                      tx.amountCents ?? 0,
                      asset,
                      isAdd ? true : false,
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet. Add funds to get started.
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
          >
            <p className="text-sm font-medium">Delete this pot?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {pot.balanceCents > 0
                ? `The remaining ${formatMoney(pot.balanceCents, pot.currencyCode)} will be moved back to your ${pot.currencyCode} balance.`
                : "This action cannot be undone."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={archivePot.isPending}
                className="flex-1"
              >
                {archivePot.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
