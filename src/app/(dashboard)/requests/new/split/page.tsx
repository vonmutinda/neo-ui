"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useCreateBatchPaymentRequest } from "@/hooks/use-payment-requests";
import { toE164 } from "@/lib/phone-utils";
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

type Added = { phone: string; id: string; name: string };

function displayName(info: RecipientInfo): string {
  const parts = [info.firstName, info.lastName].filter(Boolean);
  if (parts.length > 0) return parts.join(" ");
  if (info.username) return `@${info.username}`;
  return toE164(info.phoneNumber);
}

export default function SplitRequestPage() {
  const router = useRouter();
  const resolve = useResolveRecipient();
  const createBatch = useCreateBatchPaymentRequest();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [resolveError, setResolveError] = useState("");
  const [people, setPeople] = useState<Added[]>([]);
  const [splitMode, setSplitMode] = useState<"even" | "custom">("even");
  const [totalAmountStr, setTotalAmountStr] = useState("");
  const [currency, setCurrency] = useState<SupportedCurrency>("ETB");
  const [narration, setNarration] = useState("");
  const [customByPhone, setCustomByPhone] = useState<Record<string, string>>(
    {},
  );

  const totalCents = Math.round(parseFloat(totalAmountStr || "0") * 100);
  const evenPer =
    people.length > 0 ? Math.floor(totalCents / people.length) : 0;

  const customTotals = useMemo(() => {
    let sum = 0;
    for (const p of people) {
      const v = parseFloat(customByPhone[p.phone] || "0");
      sum += Math.round(v * 100);
    }
    return sum;
  }, [people, customByPhone]);

  async function handleLookup() {
    if (!identifier.trim()) return;
    setResolveError("");
    try {
      const info = await resolve.mutateAsync(identifier.trim());
      const phone = toE164(info.phoneNumber);
      if (people.some((p) => p.phone === phone)) {
        setResolveError("Already added.");
        return;
      }
      setPeople((prev) => [
        ...prev,
        { phone, id: info.id, name: displayName(info) },
      ]);
      setIdentifier("");
    } catch {
      setResolveError("User not found. Check the phone number or username.");
    }
  }

  function removePerson(phone: string) {
    setPeople((prev) => prev.filter((p) => p.phone !== phone));
    setCustomByPhone((prev) => {
      const next = { ...prev };
      delete next[phone];
      return next;
    });
  }

  function goContinue() {
    if (people.length < 2) return;
    setStep(2);
    const init: Record<string, string> = {};
    for (const p of people) {
      init[p.phone] = people.length > 0 ? (evenPer / 100).toFixed(2) : "0.00";
    }
    setCustomByPhone(init);
  }

  async function handleSubmit() {
    if (people.length < 2 || totalCents <= 0) return;
    try {
      if (splitMode === "even") {
        await createBatch.mutateAsync({
          recipients: people.map((p) => p.phone),
          totalAmountCents: totalCents,
          currencyCode: currency,
          narration: narration.trim() || "Split request",
        });
      } else {
        const customAmounts: Record<string, number> = {};
        for (const p of people) {
          const cents = Math.round(
            parseFloat(customByPhone[p.phone] || "0") * 100,
          );
          customAmounts[p.phone] = cents;
        }
        await createBatch.mutateAsync({
          recipients: people.map((p) => p.phone),
          totalAmountCents: customTotals,
          currencyCode: currency,
          narration: narration.trim() || "Split request",
          customAmounts,
        });
      }
      router.push("/transactions?filter=requests");
    } catch {
      /* toast */
    }
  }

  const canContinue = people.length >= 2;
  const customValid =
    splitMode === "custom" &&
    people.length > 0 &&
    customTotals === totalCents &&
    totalCents > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Split request" backHref="/requests/new" />

      {step === 1 && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add people
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Look up at least two people to split a payment request.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {people.map((p) => (
              <div
                key={p.phone}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1.5"
              >
                <UserAvatar
                  name={p.name}
                  size="sm"
                  className="h-6 w-6 text-[10px]"
                />
                <span className="text-sm font-medium">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removePerson(p.phone)}
                  aria-label={`Remove ${p.name}`}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Phone or username
            </label>
            <div className="relative">
              <Input
                placeholder="Phone or @username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="h-14 pr-10 text-lg"
              />
              {resolve.isPending && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleLookup}
            disabled={resolve.isPending}
          >
            Lookup
          </Button>

          {resolveError && (
            <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{resolveError}</p>
            </div>
          )}

          <Button
            type="button"
            size="cta"
            disabled={!canContinue}
            onClick={goContinue}
          >
            Continue
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSplitMode("even")}
              className={`flex-1 rounded-xl border py-3 text-sm font-medium ${
                splitMode === "even"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60"
              }`}
            >
              Split evenly
            </button>
            <button
              type="button"
              onClick={() => setSplitMode("custom")}
              className={`flex-1 rounded-xl border py-3 text-sm font-medium ${
                splitMode === "custom"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60"
              }`}
            >
              Custom amounts
            </button>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Total amount
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={totalAmountStr}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d{0,2}$/.test(v))
                    setTotalAmountStr(v);
                }}
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
            {splitMode === "even" && people.length > 0 && totalCents > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                ≈ {(evenPer / 100).toFixed(2)} {currency} per person
              </p>
            )}
            {splitMode === "custom" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Allocated: {(customTotals / 100).toFixed(2)} {currency} (must
                match total)
              </p>
            )}
          </div>

          {splitMode === "custom" &&
            people.map((p) => (
              <div key={p.phone} className="flex items-center gap-3">
                <span className="w-28 truncate text-sm">{p.name}</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={customByPhone[p.phone] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) {
                      setCustomByPhone((prev) => ({ ...prev, [p.phone]: v }));
                    }
                  }}
                  className="font-tabular"
                />
              </div>
            ))}

          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Note (optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Dinner at Yod Abyssinia"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="h-12"
            />
          </div>

          <Button
            size="cta"
            disabled={
              createBatch.isPending ||
              totalCents <= 0 ||
              (splitMode === "custom" && !customValid)
            }
            onClick={handleSubmit}
          >
            {createBatch.isPending && (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            )}
            Send split request
          </Button>
        </>
      )}
    </div>
  );
}
