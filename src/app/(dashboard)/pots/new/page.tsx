"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCreatePot } from "@/hooks/use-pots";
import { useBalances } from "@/hooks/use-balances";
import { useTelegram } from "@/providers/TelegramProvider";
import { toast } from "sonner";
import type { SupportedCurrency } from "@/lib/types";

const EMOJIS = ["🎯", "✈️", "🏠", "🚗", "📱", "💰", "🎓", "🏥", "🛍️", "🎉"];

export default function NewPotPage() {
  const router = useRouter();
  const { haptic } = useTelegram();
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

    const targetCents = targetAmount ? Math.round(parseFloat(targetAmount) * 100) : undefined;

    try {
      await createPot.mutateAsync({
        name: name.trim(),
        currencyCode: currency,
        targetCents: targetCents && targetCents > 0 ? targetCents : undefined,
        emoji,
      });
      haptic("medium");
      router.push("/");
    } catch (err) {
      haptic("heavy");
      toast.error(err instanceof Error ? err.message : "Failed to create pot");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Create a Pot</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emoji picker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => { setEmoji(e); haptic("light"); }}
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
                  emoji === e
                    ? "scale-110 bg-primary/15 ring-2 ring-primary"
                    : "bg-muted hover:bg-muted/80"
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
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Name
          </label>
          <input
            type="text"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vacation Fund"
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
          />
        </motion.div>

        {/* Currency */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Currency
          </label>
          <div className="flex gap-2">
            {availableCurrencies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c as SupportedCurrency)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  currency === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Target amount (optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
          />
        </motion.div>

        <Button
          type="submit"
          size="lg"
          className="h-14 w-full"
          disabled={!name.trim() || createPot.isPending}
        >
          {createPot.isPending ? "Creating..." : "Create Pot"}
        </Button>
      </form>
    </div>
  );
}
