"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import {
  useCreatePaymentRequest,
  useCreateBatchPaymentRequest,
} from "@/hooks/use-payment-requests";
import { useRecipients } from "@/hooks/use-recipients";
import { toE164, formatPhoneDisplay } from "@/lib/phone-utils";
import type { RecipientInfo, SupportedCurrency } from "@/lib/types";

const CURRENCY_OPTIONS: { code: SupportedCurrency; label: string }[] = [
  { code: "ETB", label: "ETB" },
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "GBP", label: "GBP" },
  { code: "AED", label: "AED" },
  { code: "SAR", label: "SAR" },
  { code: "CNY", label: "CNY" },
  { code: "KES", label: "KES" },
];

interface Recipient {
  phone: string;
  name: string;
  id: string;
}

function recipientDisplayName(r: RecipientInfo): string {
  const parts = [r.firstName, r.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (r.username) return `@${r.username}`;
  return toE164(r.phoneNumber);
}

export default function NewRequestPage() {
  const router = useRouter();
  const resolve = useResolveRecipient();
  const createRequest = useCreatePaymentRequest();
  const createBatch = useCreateBatchPaymentRequest();
  const recentsQuery = useRecipients({ limit: 8 });
  const recentEnviarUsers = (recentsQuery.data?.recipients ?? []).filter(
    (r) => r.type === "enviar_user",
  );

  const [identifier, setIdentifier] = useState("");
  const [resolved, setResolved] = useState<RecipientInfo | null>(null);
  const [resolveError, setResolveError] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [amountStr, setAmountStr] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("ETB");
  const [narration, setNarration] = useState("");

  const amountCents = Math.round(parseFloat(amountStr || "0") * 100);
  const isSplit = recipients.length > 1;
  const hasRecipients = recipients.length > 0;
  const perPersonCents = isSplit
    ? Math.floor(amountCents / recipients.length)
    : amountCents;

  function handleIdentifierChange(value: string) {
    setIdentifier(value);
    setResolved(null);
    setResolveError("");
  }

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

  function handleRecentTap(r: (typeof recentEnviarUsers)[number]) {
    const phone = toE164(r.number ?? "");
    if (hasRecipients) {
      // Progressive add
      if (recipients.some((rec) => rec.phone === phone)) return;
      setRecipients((prev) => [
        ...prev,
        { phone, name: r.displayName, id: r.enviarUserId ?? "" },
      ]);
    } else {
      setIdentifier(r.number ?? r.username ?? "");
      setResolved(null);
      setResolveError("");
      (async () => {
        try {
          const info = await resolve.mutateAsync(
            (r.number ?? r.username ?? "").trim(),
          );
          setResolved(info);
        } catch {
          setResolveError(
            "User not found. Check the phone number or username.",
          );
        }
      })();
    }
  }

  function handleAddAnother() {
    if (!resolved) return;
    const phone = toE164(resolved.phoneNumber);
    const name = recipientDisplayName(resolved);
    if (recipients.some((r) => r.phone === phone)) return;
    setRecipients((prev) => [...prev, { phone, name, id: resolved.id }]);
    setIdentifier("");
    setResolved(null);
    setResolveError("");
  }

  /** First resolve → commit as first recipient */
  function commitFirstRecipient() {
    if (!resolved || hasRecipients) return;
    const phone = toE164(resolved.phoneNumber);
    const name = recipientDisplayName(resolved);
    setRecipients([{ phone, name, id: resolved.id }]);
  }

  // Auto-commit first recipient when resolved
  if (resolved && !hasRecipients) {
    commitFirstRecipient();
  }

  function handleRemove(phone: string) {
    setRecipients((prev) => prev.filter((r) => r.phone !== phone));
  }

  function handleAmountChange(value: string) {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmountStr(value);
    }
  }

  const isPending = createRequest.isPending || createBatch.isPending;

  async function handleSubmit() {
    if (recipients.length < 1 || amountCents <= 0) return;

    try {
      if (isSplit) {
        await createBatch.mutateAsync({
          recipients: recipients.map((r) => r.phone),
          totalAmountCents: amountCents,
          currencyCode: currency,
          narration: narration.trim() || "Split request",
        });
      } else {
        await createRequest.mutateAsync({
          recipient: recipients[0].phone,
          amountCents,
          currencyCode: currency,
          narration: narration.trim() || "Payment request",
        });
      }
      router.push("/transactions?filter=requests");
    } catch {
      // toast handled by hook
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Request Money"
        backHref="/transactions?filter=requests"
      />

      {/* Recents */}
      {recentEnviarUsers.length > 0 && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recent
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentEnviarUsers.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRecentTap(r)}
                className="flex shrink-0 flex-col items-center gap-1"
              >
                <UserAvatar name={r.displayName} size="lg" />
                <span className="w-14 truncate text-center text-[10px]">
                  {r.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recipient chips */}
      {hasRecipients && (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            {recipients.length} {recipients.length === 1 ? "person" : "people"}
          </p>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => (
              <div
                key={r.phone}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1.5"
              >
                <UserAvatar
                  name={r.name}
                  size="sm"
                  className="h-6 w-6 text-[10px]"
                />
                <span className="text-sm font-medium">{r.name}</span>
                <button
                  onClick={() => handleRemove(r.phone)}
                  aria-label={`Remove ${r.name}`}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Identifier input — for adding more people */}
      <div>
        <label
          htmlFor="identifier"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {hasRecipients ? "Add another person" : "Phone number or username"}
        </label>
        <div className="relative">
          <Input
            id="identifier"
            type="text"
            inputMode="text"
            placeholder="+251 9XX... or @username"
            value={identifier}
            onChange={(e) => handleIdentifierChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="h-14 pr-10 text-lg"
            autoFocus={!hasRecipients}
          />
          {resolve.isPending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Resolved — with "+" to add */}
      {resolved && hasRecipients && (
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-primary/10 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {recipientDisplayName(resolved)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatPhoneDisplay(resolved.phoneNumber)}
              {resolved.username && ` · @${resolved.username}`}
            </p>
          </div>
          <button
            onClick={handleAddAnother}
            disabled={recipients.length >= 10}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted active:bg-muted disabled:opacity-50"
            aria-label="Add this person"
          >
            <Plus className="h-4 w-4 text-primary" />
          </button>
        </div>
      )}

      {/* Resolve error */}
      {resolveError && (
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{resolveError}</p>
        </div>
      )}

      {/* Amount & note — visible once at least one recipient */}
      {hasRecipients && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Amount
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-14 flex-1 font-tabular text-2xl"
              />
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value as SupportedCurrency)
                }
                className="h-14 rounded-xl border border-border/60 bg-card px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {isSplit && amountCents > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                ≈ {(perPersonCents / 100).toFixed(2)} {currency} per person
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Note (optional)
            </label>
            <Input
              type="text"
              placeholder="What's this for?"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="h-12"
            />
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        size="cta"
        disabled={recipients.length < 1 || amountCents <= 0 || isPending}
        onClick={handleSubmit}
        className="mt-4"
      >
        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {isSplit ? "Split Request" : "Send Request"}
      </Button>
    </div>
  );
}
