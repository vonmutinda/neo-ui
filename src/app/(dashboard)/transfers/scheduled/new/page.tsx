"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreateScheduledTransfer } from "@/hooks/use-scheduled-transfers";
import { useRecipients } from "@/hooks/use-recipients";
import type { SupportedCurrency, ScheduledFrequency } from "@/lib/types";
import { toast } from "sonner";

const FREQUENCIES: ScheduledFrequency[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

export default function NewScheduledTransferPage() {
  const router = useRouter();
  const { data: recipientData, isLoading: recipientsLoading } = useRecipients();
  const createTransfer = useCreateScheduledTransfer();

  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("ETB");
  const [frequency, setFrequency] = useState<ScheduledFrequency>("monthly");
  const [narration, setNarration] = useState("");
  const [maxRuns, setMaxRuns] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!recipientId || !amount) return;

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (amountCents <= 0) return;

    try {
      await createTransfer.mutateAsync({
        recipientId,
        amountCents,
        currency,
        frequency,
        narration: narration.trim() || "",
        maxRuns: maxRuns ? parseInt(maxRuns, 10) : undefined,
      });
      toast.success("Scheduled transfer created");
      router.push("/transfers/scheduled");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create scheduled transfer",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Scheduled Transfer"
        backHref="/transfers/scheduled"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recipient
          </label>
          {recipientsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-2xl border border-border/60 bg-card p-2">
              {recipientData?.recipients?.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRecipientId(r.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                    recipientId === r.id
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {r.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.number || r.accountNumber || ""}
                    </p>
                  </div>
                </button>
              ))}
              {(!recipientData?.recipients ||
                recipientData.recipients.length === 0) && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No recipients found
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Amount
          </label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-lg font-semibold tabular-nums"
          />
        </motion.div>

        {/* Currency */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Currency
          </label>
          <div className="flex gap-2">
            {(["ETB", "USD", "GBP", "EUR"] as SupportedCurrency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
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
        </motion.div>

        {/* Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Frequency
          </label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-all ${
                  frequency === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 bg-card text-muted-foreground hover:bg-primary/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Narration */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Narration
          </label>
          <Input
            type="text"
            maxLength={100}
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="e.g. Monthly rent payment"
          />
        </motion.div>

        {/* Max runs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Max runs (optional)
          </label>
          <Input
            type="number"
            min="1"
            value={maxRuns}
            onChange={(e) => setMaxRuns(e.target.value)}
            placeholder="Unlimited"
          />
        </motion.div>

        <Button
          type="submit"
          size="cta"
          disabled={!recipientId || !amount || createTransfer.isPending}
        >
          {createTransfer.isPending ? "Creating..." : "Create Schedule"}
        </Button>
      </form>
    </div>
  );
}
