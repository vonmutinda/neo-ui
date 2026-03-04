"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Delete } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { useSendStore } from "@/lib/send-store";
import { useTelegram } from "@/providers/TelegramProvider";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

const CURRENCIES: { code: SupportedCurrency; symbol: string }[] = [
  { code: "ETB", symbol: "Br" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"] as const;

const SYMBOL_MAP: Record<SupportedCurrency, string> = {
  ETB: "Br",
  USD: "$",
  EUR: "€",
};

type AmountMode = "split" | "custom";

export default function SendAmountPage() {
  const router = useRouter();
  const { haptic } = useTelegram();
  const {
    recipientPhone, setCurrency, setAmount, setNarration, currency,
    isMultiSend, recipients, setBulkAmount, setBulkNarration,
    setRecipientAmount, setRecipientNarration,
  } = useSendStore();

  const [display, setDisplay] = useState("0");
  const [note, setNote] = useState("");
  const [amountMode, setAmountMode] = useState<AmountMode>("split");

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [customNarrations, setCustomNarrations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isMultiSend ? recipients.length < 2 : !recipientPhone) {
      router.replace("/send");
    }
  }, [recipientPhone, isMultiSend, recipients.length, router]);

  const handleKey = useCallback(
    (key: string) => {
      haptic("light");

      if (key === "DEL") {
        setDisplay((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
        return;
      }

      if (key === ".") {
        setDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
        return;
      }

      setDisplay((prev) => {
        if (prev === "0") return key;
        const parts = prev.split(".");
        if (parts[1] && parts[1].length >= 2) return prev;
        if (prev.length >= 12) return prev;
        return prev + key;
      });
    },
    [haptic],
  );

  const amountCents = Math.round(parseFloat(display || "0") * 100);

  const customTotal = recipients.reduce((sum, r) => {
    const val = parseFloat(customAmounts[r.phone] || "0");
    return sum + Math.round(val * 100);
  }, 0);

  const isValid = isMultiSend
    ? amountMode === "split"
      ? amountCents > 0
      : customTotal > 0
    : amountCents > 0;

  function handleContinue() {
    if (isMultiSend) {
      if (amountMode === "split") {
        const perPerson = Math.floor(amountCents / recipients.length);
        setBulkAmount(perPerson);
        setBulkNarration(note);
        setAmount(amountCents);
      } else {
        for (const r of recipients) {
          const cents = Math.round(parseFloat(customAmounts[r.phone] || "0") * 100);
          setRecipientAmount(r.phone, cents);
          setRecipientNarration(r.phone, customNarrations[r.phone] || "");
        }
        setAmount(customTotal);
      }
      setNarration(note);
      router.push("/send/confirm");
      return;
    }

    setAmount(amountCents);
    setNarration(note);
    router.push("/send/confirm");
  }

  return (
    <motion.div
      className="flex min-h-[calc(100dvh-6rem)] flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/send"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Enter Amount</h1>
      </div>

      {/* Currency pills */}
      <div className="mt-6 flex justify-center gap-2">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              currency === c.code
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <CurrencyFlag currency={c.code} size="sm" />
            {c.code}
          </button>
        ))}
      </div>

      {/* Multi-send mode selector */}
      {isMultiSend && (
        <div className="mt-6 flex justify-center">
          <div className="inline-flex rounded-full border bg-muted p-1">
            <button
              onClick={() => setAmountMode("split")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                amountMode === "split" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Split total
            </button>
            <button
              onClick={() => setAmountMode("custom")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                amountMode === "custom" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Custom amounts
            </button>
          </div>
        </div>
      )}

      {/* Custom amounts per recipient */}
      {isMultiSend && amountMode === "custom" ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          {recipients.map((r) => (
            <div key={r.phone} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <UserAvatar name={r.name} />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">{r.name}</p>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={customAmounts[r.phone] ?? ""}
                  onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [r.phone]: e.target.value }))}
                  className="h-10"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={customNarrations[r.phone] ?? ""}
                  onChange={(e) => setCustomNarrations((prev) => ({ ...prev, [r.phone]: e.target.value }))}
                  maxLength={100}
                  className="w-full border-0 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          ))}
          <p className="text-center text-sm font-medium text-muted-foreground">
            Total: {formatMoney(customTotal, currency)}
          </p>
        </div>
      ) : (
        <>
          {/* Amount display */}
          <div className="flex flex-1 flex-col items-center justify-center py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={display}
                initial={{ scale: 0.95, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0.5 }}
                transition={{ duration: 0.1 }}
                className="font-tabular text-center"
              >
                <span className="text-2xl text-muted-foreground">
                  {SYMBOL_MAP[currency]}
                </span>
                <span className="text-5xl font-bold tracking-tight">{display}</span>
              </motion.div>
            </AnimatePresence>

            {/* Split calculation for multi-send */}
            {isMultiSend && amountMode === "split" && amountCents > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {formatMoney(amountCents, currency)} / {recipients.length} people = {formatMoney(Math.floor(amountCents / recipients.length), currency)} each
              </p>
            )}

            {/* Optional note */}
            <input
              type="text"
              placeholder="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
              className="mt-4 w-64 border-0 bg-transparent text-center text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Numeric keypad */}
          <div className="grid grid-cols-3 gap-2 px-2 pb-4">
            {KEYS.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="flex h-16 items-center justify-center rounded-2xl text-xl font-semibold transition-colors active:bg-muted"
              >
                {key === "DEL" ? <Delete className="h-6 w-6" /> : key}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Continue */}
      <div className="px-2 pb-6">
        <Button
          size="lg"
          disabled={!isValid}
          onClick={handleContinue}
          className="h-14 w-full text-base font-semibold"
        >
          Review
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
