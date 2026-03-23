"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Delete } from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { useSendStore } from "@/lib/send-store";

import { useBalances } from "@/hooks/use-balances";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

const CURRENCY_ORDER: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];
const SYMBOL_BY_CODE: Record<SupportedCurrency, string> = {
  ETB: "Br",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "﷼",
  CNY: "¥",
  KES: "KSh",
};

const KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  ".",
  "0",
  "DEL",
] as const;

export default function SendAmountPage() {
  const router = useRouter();

  const {
    setCurrency,
    setAmount,
    setNarration,
    currency,
    recipients,
    setBulkAmount,
    setBulkNarration,
    setRecipientAmount,
    setRecipientNarration,
  } = useSendStore();

  const isMulti = recipients.length > 1;

  const { data: balances } = useBalances();
  const availableCurrencies = useMemo((): SupportedCurrency[] => {
    const codes = new Set(
      (balances ?? []).map((b) => b.currencyCode as SupportedCurrency),
    );
    return CURRENCY_ORDER.filter((c) => codes.has(c));
  }, [balances]);

  const [display, setDisplay] = useState("0");
  const [note, setNote] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    {},
  );
  const [customNarrations, setCustomNarrations] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (recipients.length < 1) {
      router.replace("/send");
    }
  }, [recipients.length, router]);

  useEffect(() => {
    if (
      availableCurrencies.length > 0 &&
      !availableCurrencies.includes(currency)
    ) {
      setCurrency(availableCurrencies[0]);
    }
  }, [availableCurrencies, currency, setCurrency]);

  const hasNoBalances = (balances?.length ?? 0) === 0;

  const handleKey = useCallback((key: string) => {
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
  }, []);

  const amountCents = Math.round(parseFloat(display || "0") * 100);

  const customTotal = recipients.reduce((sum, r) => {
    const val = parseFloat(customAmounts[r.phone] || "0");
    return sum + Math.round(val * 100);
  }, 0);

  const isValid =
    !hasNoBalances &&
    (isMulti && showCustom ? customTotal > 0 : amountCents > 0);

  function handleContinue() {
    if (isMulti) {
      if (showCustom) {
        for (const r of recipients) {
          const cents = Math.round(
            parseFloat(customAmounts[r.phone] || "0") * 100,
          );
          setRecipientAmount(r.phone, cents);
          setRecipientNarration(r.phone, customNarrations[r.phone] || "");
        }
        setAmount(customTotal);
      } else {
        const perPerson = Math.floor(amountCents / recipients.length);
        setBulkAmount(perPerson);
        setBulkNarration(note);
        setAmount(amountCents);
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
    <div className="flex min-h-[calc(100dvh-6rem)] flex-col">
      <PageHeader title="Enter Amount" backHref="/send" />

      {/* Currency pills */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasNoBalances ? (
          <p className="text-center text-sm text-muted-foreground">
            Add a balance to send money.
          </p>
        ) : (
          availableCurrencies.map((code) => (
            <button
              key={code}
              onClick={() => setCurrency(code)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                currency === code
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              <CurrencyFlag currency={code} size="sm" />
              {code}
            </button>
          ))
        )}
      </div>

      {/* Custom amounts per recipient */}
      {isMulti && showCustom ? (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4">
          {recipients.map((r) => (
            <div
              key={r.phone}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <UserAvatar name={r.name} />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">{r.name}</p>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="Amount"
                  value={customAmounts[r.phone] ?? ""}
                  onChange={(e) =>
                    setCustomAmounts((prev) => ({
                      ...prev,
                      [r.phone]: e.target.value,
                    }))
                  }
                  className="h-10"
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={customNarrations[r.phone] ?? ""}
                  onChange={(e) =>
                    setCustomNarrations((prev) => ({
                      ...prev,
                      [r.phone]: e.target.value,
                    }))
                  }
                  maxLength={100}
                  className="w-full border-0 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          ))}
          <p className="text-center text-sm font-medium text-muted-foreground">
            Total: {formatMoney(customTotal, currency)}
          </p>
          <button
            onClick={() => setShowCustom(false)}
            className="text-center text-xs font-semibold text-primary"
          >
            Back to split total
          </button>
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
                  {SYMBOL_BY_CODE[currency]}
                </span>
                <span className="text-5xl font-bold tracking-tight">
                  {display}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Per-person subtitle for multi-send */}
            {isMulti && amountCents > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {formatMoney(
                  Math.floor(amountCents / recipients.length),
                  currency,
                )}{" "}
                per person
              </p>
            )}

            {/* Custom amounts link */}
            {isMulti && (
              <button
                onClick={() => setShowCustom(true)}
                className="mt-1 text-xs font-semibold text-primary"
              >
                Custom amounts
              </button>
            )}

            {/* Note */}
            <input
              type="text"
              placeholder="Note (optional)"
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
                aria-label={key === "DEL" ? "Delete" : undefined}
              >
                {key === "DEL" ? <Delete className="h-6 w-6" /> : key}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Continue */}
      <div className="px-2 pb-6">
        <Button size="cta" disabled={!isValid} onClick={handleContinue}>
          Review
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
