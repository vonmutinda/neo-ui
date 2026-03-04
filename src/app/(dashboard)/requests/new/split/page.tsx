"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  X,
  Search,
  CheckCircle2,
  Users,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useCreateBatchPaymentRequest } from "@/hooks/use-payment-requests";
import { formatMoney } from "@/lib/format";
import type { RecipientInfo } from "@/lib/types";

const MAX_RECIPIENTS = 10;

export default function SplitRequestPage() {
  const [step, setStep] = useState(1);
  const [recipients, setRecipients] = useState<RecipientInfo[]>([]);
  const [lookup, setLookup] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [success, setSuccess] = useState(false);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

  const resolve = useResolveRecipient();
  const batch = useCreateBatchPaymentRequest();

  const totalCents = Math.round(parseFloat(amount || "0") * 100);
  const perPersonCents =
    recipients.length > 0 ? Math.floor(totalCents / recipients.length) : 0;

  function getCustomCents(id: string): number {
    return Math.round(parseFloat(customAmounts[id] || "0") * 100);
  }

  const customTotalCents = recipients.reduce(
    (sum, r) => sum + getCustomCents(r.id),
    0,
  );

  function handleLookup() {
    const identifier = lookup.trim();
    if (!identifier) return;
    resolve.mutate(identifier, {
      onSuccess: (info) => {
        if (recipients.some((r) => r.id === info.id)) return;
        setRecipients((prev) => [...prev, info]);
        setLookup("");
      },
    });
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  function phoneE164(r: RecipientInfo): string {
    if (typeof r.phoneNumber === "string") return r.phoneNumber;
    return `+${r.phoneNumber.countryCode}${r.phoneNumber.number}`;
  }

  function recipientDisplayName(r: RecipientInfo) {
    if (r.firstName || r.lastName)
      return [r.firstName, r.lastName].filter(Boolean).join(" ");
    if (r.username) return `@${r.username}`;
    if (typeof r.phoneNumber === "string") return r.phoneNumber;
    return `+${r.phoneNumber.countryCode}${r.phoneNumber.number}`;
  }

  function recipientSubtext(r: RecipientInfo) {
    if (r.username) return `@${r.username}`;
    if (typeof r.phoneNumber === "string") return r.phoneNumber;
    return `+${r.phoneNumber.countryCode}${r.phoneNumber.number}`;
  }

  async function handleSend() {
    const effectiveTotal =
      splitMode === "custom" ? customTotalCents : totalCents;
    if (recipients.length < 2 || effectiveTotal <= 0 || !narration.trim())
      return;
    try {
      const phones = recipients.map((r) => phoneE164(r));
      const body: {
        totalAmountCents: number;
        currencyCode: string;
        narration: string;
        recipients: string[];
        customAmounts?: Record<string, number>;
      } = {
        totalAmountCents: effectiveTotal,
        currencyCode: "ETB",
        narration: narration.trim(),
        recipients: phones,
      };
      if (splitMode === "custom") {
        const amounts: Record<string, number> = {};
        recipients.forEach((r, i) => {
          amounts[phones[i]] = getCustomCents(r.id);
        });
        body.customAmounts = amounts;
      }
      await batch.mutateAsync(body);
      setSuccess(true);
    } catch {
      /* toast handles error */
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
        >
          <CheckCircle2 className="h-10 w-10 text-success" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold">
            Requested from {recipients.length} people
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatMoney(totalCents, "ETB")} split equally
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/requests/new"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Split Request</h1>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Add recipients */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold">Add people</h2>
              <p className="text-sm text-muted-foreground">
                Look up by phone number or username
              </p>
            </div>

            {/* Lookup input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Phone or @username"
                value={lookup}
                onChange={(e) => setLookup(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="h-12 pl-10 pr-10"
                disabled={recipients.length >= MAX_RECIPIENTS}
              />
              {resolve.isPending && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {resolve.isError && (
              <p className="text-xs text-destructive">
                Could not find that user. Check the phone or username.
              </p>
            )}

            {/* Recipient chips */}
            {recipients.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  {recipients.length} of {MAX_RECIPIENTS} people
                </p>
                <div className="flex flex-wrap gap-2">
                  {recipients.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="flex items-center gap-2 rounded-full border bg-muted py-1.5 pl-1.5 pr-3"
                    >
                      <UserAvatar name={recipientDisplayName(r)} size="sm" className="h-7 w-7 text-[10px]" />
                      <span className="text-sm font-medium">
                        {recipientDisplayName(r)}
                      </span>
                      <button
                        onClick={() => removeRecipient(r.id)}
                        className="flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {recipients.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Add at least 2 people to split with
                </p>
              </div>
            )}

            <Button
              size="lg"
              disabled={recipients.length < 2}
              onClick={() => setStep(2)}
              className="h-14 w-full text-base font-semibold"
            >
              Continue
            </Button>
          </motion.div>
        )}

        {/* Step 2: Amount + narration */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold">Amount &amp; reason</h2>
              <p className="text-sm text-muted-foreground">
                Choose how to split the amount
              </p>
            </div>

            {/* Split mode toggle */}
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              <button
                onClick={() => setSplitMode("equal")}
                className={`flex flex-1 items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  splitMode === "equal"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Split evenly
              </button>
              <button
                onClick={() => setSplitMode("custom")}
                className={`flex flex-1 items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  splitMode === "custom"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                Custom amounts
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                What&apos;s it for?
              </label>
              <Input
                placeholder="e.g. Dinner at Yod Abyssinia"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="h-14 text-base"
              />
            </div>

            {splitMode === "equal" ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                    Total Amount (ETB)
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 text-lg"
                    autoFocus
                  />
                </div>

                {totalCents > 0 && recipients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-primary/10 p-3 text-center"
                  >
                    <p className="text-sm font-medium text-primary">
                      {formatMoney(totalCents, "ETB")} ÷ {recipients.length}{" "}
                      people = {formatMoney(perPersonCents, "ETB")} each
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  {recipients.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
                    >
                      <UserAvatar name={recipientDisplayName(r)} className="h-9 w-9" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {recipientDisplayName(r)}
                        </p>
                      </div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={customAmounts[r.id] ?? ""}
                        onChange={(e) =>
                          setCustomAmounts((prev) => ({
                            ...prev,
                            [r.id]: e.target.value,
                          }))
                        }
                        className="h-10 w-28 text-right text-sm font-tabular"
                      />
                    </div>
                  ))}
                </div>

                {customTotalCents > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-primary/10 p-3 text-center"
                  >
                    <p className="text-sm font-medium text-primary">
                      Total: {formatMoney(customTotalCents, "ETB")}
                    </p>
                  </motion.div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                className="h-14 flex-1 text-base"
              >
                Back
              </Button>
              <Button
                size="lg"
                disabled={
                  (splitMode === "equal"
                    ? totalCents <= 0
                    : customTotalCents <= 0) || !narration.trim()
                }
                onClick={() => setStep(3)}
                className="h-14 flex-1 text-base font-semibold"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold">Confirm split</h2>
              <p className="text-sm text-muted-foreground">
                Review before sending requests
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold font-tabular">
                  {formatMoney(
                    splitMode === "custom" ? customTotalCents : totalCents,
                    "ETB",
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Split</span>
                <span className="text-sm font-medium">
                  {splitMode === "equal" ? "Equal" : "Custom"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Recipients
                </span>
                <span className="text-sm font-semibold">
                  {recipients.length} people
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reason</span>
                <span className="text-sm font-medium truncate max-w-[60%] text-right">
                  {narration}
                </span>
              </div>
            </div>

            {/* Recipient breakdown */}
            <div className="space-y-1">
              {recipients.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="flex items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
                >
                  <UserAvatar name={recipientDisplayName(r)} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {recipientDisplayName(r)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {recipientSubtext(r)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold font-tabular text-primary">
                    {formatMoney(
                      splitMode === "custom"
                        ? getCustomCents(r.id)
                        : perPersonCents,
                      "ETB",
                    )}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                className="h-14 flex-1 text-base"
              >
                Back
              </Button>
              <Button
                size="lg"
                disabled={batch.isPending}
                onClick={handleSend}
                className="h-14 flex-1 text-base font-semibold"
              >
                {batch.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Send Requests"
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
