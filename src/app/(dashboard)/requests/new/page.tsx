"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useCreatePaymentRequest } from "@/hooks/use-payment-requests";
import { formatMoney } from "@/lib/format";
import type { RecipientInfo, SupportedCurrency } from "@/lib/types";

function recipientDisplayName(r: RecipientInfo): string {
  const parts = [r.firstName, r.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (r.username) return `@${r.username}`;
  return typeof r.phoneNumber === "string" ? r.phoneNumber : `+${r.phoneNumber.countryCode}${r.phoneNumber.number}`;
}

export default function NewRequestPage() {
  const router = useRouter();
  const resolve = useResolveRecipient();
  const createRequest = useCreatePaymentRequest();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [resolved, setResolved] = useState<RecipientInfo | null>(null);
  const [resolveError, setResolveError] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [currency] = useState<SupportedCurrency>("ETB");

  const amountCents = Math.round(parseFloat(amount || "0") * 100);

  async function handleLookup() {
    if (!identifier.trim()) return;
    setResolveError("");
    setResolved(null);
    try {
      const info = await resolve.mutateAsync(identifier.trim());
      setResolved(info);
    } catch {
      setResolveError("User not found. Check the phone number or username.");
    }
  }

  async function handleSubmit() {
    if (!resolved || amountCents <= 0 || !narration.trim()) return;
    const phone = typeof resolved.phoneNumber === "string"
      ? resolved.phoneNumber
      : `+${resolved.phoneNumber.countryCode}${resolved.phoneNumber.number}`;
    try {
      await createRequest.mutateAsync({
        recipient: phone,
        amountCents,
        currencyCode: currency,
        narration: narration.trim(),
      });
      router.push("/requests");
    } catch {
      /* toast handles error */
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/requests"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Request Money</h1>
      </div>

      {/* Split with friends link */}
      <Link href="/requests/new/split">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-5 transition-colors active:bg-muted/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <Users className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Split with friends</p>
            <p className="text-xs text-muted-foreground">
              Request from multiple people at once
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </Link>

      {/* Step 1: Select recipient */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Request from
          </h2>

          <div className="relative">
            <Input
              placeholder="Phone number or @username"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setResolved(null);
                setResolveError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="h-14 pr-10 text-base"
              autoFocus
            />
            {resolve.isPending && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {resolved && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{recipientDisplayName(resolved)}</p>
                {resolved.username && (
                  <p className="truncate text-xs text-muted-foreground">@{resolved.username}</p>
                )}
              </div>
            </motion.div>
          )}

          {resolveError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{resolveError}</p>
            </motion.div>
          )}

          <Button
            size="lg"
            disabled={!resolved}
            onClick={() => setStep(2)}
            className="h-14 w-full text-base font-semibold"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      )}

      {/* Step 2: Amount + narration */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Amount & Note
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Amount ({currency})
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
              What&apos;s this for?
            </label>
            <Input
              placeholder="e.g. Lunch money"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="h-14 text-base"
              maxLength={140}
            />
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setStep(1)}
              className="h-14 flex-1 text-base"
            >
              Back
            </Button>
            <Button
              size="lg"
              disabled={amountCents <= 0 || !narration.trim()}
              onClick={() => setStep(3)}
              className="h-14 flex-1 text-base font-semibold"
            >
              Continue
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && resolved && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Confirm Request
          </h2>

          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-col items-center gap-3 p-8">
              <p className="text-3xl font-bold font-tabular">
                {formatMoney(amountCents, currency)}
              </p>
              <p className="text-sm text-muted-foreground">
                from {recipientDisplayName(resolved)}
              </p>
              <p className="text-xs text-muted-foreground">
                &ldquo;{narration}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setStep(2)}
              className="h-14 flex-1 text-base"
            >
              Back
            </Button>
            <Button
              size="lg"
              disabled={createRequest.isPending}
              onClick={handleSubmit}
              className="h-14 flex-1 text-base font-semibold"
            >
              {createRequest.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Request"
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
