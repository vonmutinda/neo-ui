"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowDown, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { useBalances } from "@/hooks/use-balances";
import { useExchangeRate, useConvert } from "@/hooks/use-convert";
import { toast } from "sonner";
import type { SupportedCurrency } from "@/lib/types";

type Step = "amount" | "review" | "success";

const CURRENCIES: SupportedCurrency[] = ["ETB", "USD", "EUR"];

export default function ConvertPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromParam = (searchParams.get("from")?.toUpperCase() ?? "ETB") as SupportedCurrency;

  const [fromCurrency, setFromCurrency] = useState<SupportedCurrency>(fromParam);
  const [toCurrency, setToCurrency] = useState<SupportedCurrency>(
    CURRENCIES.find((c) => c !== fromParam) ?? "USD",
  );
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<Step>("amount");
  const [result, setResult] = useState<{
    transactionId: string;
    toAmountCents: number;
    rate: number;
  } | null>(null);

  const { data: balances } = useBalances();
  const { data: rateData, isLoading: rateLoading } = useExchangeRate(fromCurrency, toCurrency);
  const convertMutation = useConvert();

  const displayRate = rateData?.mid ?? 0;
  const askRate = rateData?.ask ?? 0;
  const amountNum = parseFloat(amount) || 0;
  const amountCents = Math.round(amountNum * 100);
  const receiveCents = askRate > 0 ? Math.round(amountCents * askRate) : 0;
  const receiveDisplay = (receiveCents / 100).toFixed(2);

  const fromBalance = balances?.find((b) => b.currencyCode === fromCurrency);
  const hasEnough = fromBalance ? amountCents <= fromBalance.balanceCents : false;

  const targetCurrencies = CURRENCIES.filter((c) => c !== fromCurrency);

  const canProceed = amountCents > 0 && hasEnough && askRate > 0 && !rateLoading;
  const buttonLabel = rateLoading
    ? "Loading rate..."
    : !hasEnough && amountCents > 0
      ? "Insufficient balance"
      : amountCents <= 0
        ? "Review conversion"
        : askRate <= 0
          ? "Rate unavailable"
          : "Review conversion";

  async function handleConvert() {
    try {
      const res = await convertMutation.mutateAsync({
        fromCurrency,
        toCurrency,
        amountCents,
      });
      setResult({
        transactionId: res.transactionId,
        toAmountCents: res.toAmountCents,
        rate: res.rate,
      });
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={step === "review" ? "#" : `/balances/${fromCurrency}`}
          onClick={(e) => {
            if (step === "review") {
              e.preventDefault();
              setStep("amount");
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">
          {step === "success" ? "Conversion complete" : `Convert ${fromCurrency}`}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "amount" && (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* From */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                From
              </label>
              <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <CurrencyFlag currency={fromCurrency} size="md" />
                <div className="flex-1">
                  <select
                    value={fromCurrency}
                    onChange={(e) => {
                      const val = e.target.value as SupportedCurrency;
                      setFromCurrency(val);
                      if (val === toCurrency) {
                        setToCurrency(CURRENCIES.find((c) => c !== val) ?? "ETB");
                      }
                    }}
                    className="bg-transparent text-sm font-medium outline-none"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {fromBalance && (
                    <p className="text-xs text-muted-foreground">
                      Available: {fromBalance.display}
                    </p>
                  )}
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-32 bg-transparent text-right text-2xl font-bold tabular-nums outline-none"
                />
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                To
              </label>
              <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <CurrencyFlag currency={toCurrency} size="md" />
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as SupportedCurrency)}
                  className="bg-transparent text-sm font-medium outline-none"
                >
                  {targetCurrencies.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="ml-auto text-2xl font-bold tabular-nums text-muted-foreground">
                  {amountNum > 0 && askRate > 0 ? receiveDisplay : "0.00"}
                </span>
              </div>
            </div>

            {/* Rate info */}
            {displayRate > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                1 {fromCurrency} = {displayRate.toFixed(4)} {toCurrency}
              </p>
            )}

            {/* Review button */}
            <Button
              size="lg"
              className="h-14 w-full"
              disabled={!canProceed}
              onClick={() => setStep("review")}
            >
              {buttonLabel}
            </Button>
          </motion.div>
        )}

        {step === "review" && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-4 text-center text-lg font-semibold">
                Convert {amount} {fromCurrency} to {toCurrency}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">You send</span>
                  <span className="text-sm font-semibold tabular-nums">
                    {amountNum.toFixed(2)} {fromCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Exchange rate</span>
                  <span className="text-sm font-medium">
                    1 {fromCurrency} = {displayRate.toFixed(4)} {toCurrency}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">You receive</span>
                    <span className="text-lg font-bold tabular-nums text-success">
                      {receiveDisplay} {toCurrency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="h-14 w-full"
              onClick={handleConvert}
              disabled={convertMutation.isPending}
            >
              {convertMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Confirm conversion"
              )}
            </Button>
          </motion.div>
        )}

        {step === "success" && result && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
            >
              <Check className="h-10 w-10 text-success" />
            </motion.div>

            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">
                {(result.toAmountCents / 100).toFixed(2)} {toCurrency}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Converted from {amount} {fromCurrency} at {result.rate.toFixed(4)}
              </p>
            </div>

            <Button
              size="lg"
              className="h-12 w-full max-w-xs"
              onClick={() => router.push(`/balances/${fromCurrency}`)}
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
