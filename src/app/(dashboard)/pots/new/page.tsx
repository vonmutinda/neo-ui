"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCreatePot } from "@/hooks/use-pots";
import { useBalances } from "@/hooks/use-balances";

import { toast } from "sonner";
import type { SupportedCurrency } from "@/lib/types";

const EMOJIS = ["🎯", "✈️", "🏠", "🚗", "📱", "💰", "🎓", "🏥", "🛍️", "🎉"];

export default function NewPotPage() {
  const router = useRouter();

  const { data: balances } = useBalances();
  const createPot = useCreatePot();

  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("ETB");
  const [targetAmount, setTargetAmount] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  const availableCurrencies = balances?.map((b) => b.currencyCode) ?? ["ETB"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const targetCents = targetAmount
      ? Math.round(parseFloat(targetAmount) * 100)
      : undefined;

    try {
      await createPot.mutateAsync({
        name: name.trim(),
        currencyCode: currency,
        targetCents: targetCents && targetCents > 0 ? targetCents : undefined,
        emoji,
      });
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create pot");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Pot" backHref="/" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emoji picker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setEmoji(e);
                }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
                  emoji === e
                    ? "scale-110 bg-primary/15 ring-2 ring-primary"
                    : "border border-border/60 bg-card hover:bg-primary/5"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Name */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Name
          </label>
          <Input
            type="text"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vacation Fund"
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
            {availableCurrencies.map((c) => (
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
        </motion.div>

        {/* Target amount */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Target amount (optional)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
          />
        </motion.div>

        <Button
          type="submit"
          size="cta"
          disabled={!name.trim() || createPot.isPending}
        >
          {createPot.isPending ? "Creating..." : "Create Pot"}
        </Button>
      </form>
    </div>
  );
}
