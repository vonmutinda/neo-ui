"use client";

import { use, useState } from "react";
import {
  Snowflake,
  Play,
  Globe,
  Wifi,
  Banknote,
  ShoppingCart,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { CardVisual } from "@/components/cards/CardVisual";
import {
  useCard,
  useUpdateCardStatus,
  useUpdateCardToggles,
  useUpdateCardLimits,
  useDeleteCard,
} from "@/hooks/use-cards";

import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: card, isLoading } = useCard(id);
  const updateStatus = useUpdateCardStatus(id);
  const updateToggles = useUpdateCardToggles(id);
  const updateLimits = useUpdateCardLimits(id);
  const deleteCard = useDeleteCard(id);

  const [limitsOpen, setLimitsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [perTxn, setPerTxn] = useState("");
  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-12">
        <Skeleton className="aspect-[1.586/1] w-full max-w-[320px] rounded-sm" />
        <div className="h-px bg-border" />
        <div className="grid gap-12 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-foreground/90">Card not found</p>
        <Link
          href="/cards"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Go to cards
        </Link>
      </div>
    );
  }

  const isFrozen = card.status === "frozen";
  const isActive = card.status === "active";
  const canDelete = card.type === "virtual" || card.type === "ephemeral";

  async function handleFreeze() {
    await updateStatus.mutateAsync({
      status: isFrozen ? "active" : "frozen",
    });
    setSecurityOpen(false);
  }

  function handleCopyNumber() {
    if (!card) return;
    const text = `···· ···· ···· ${card.lastFour}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  async function handleToggle(
    field:
      | "allowOnline"
      | "allowContactless"
      | "allowAtm"
      | "allowInternational",
  ) {
    if (!card) return;
    await updateToggles.mutateAsync({ [field]: !card[field] });
  }

  function toggleLimitsEditor() {
    if (!card) return;
    setPerTxn(String(card.perTxnLimitCents / 100));
    setDaily(String(card.dailyLimitCents / 100));
    setMonthly(String(card.monthlyLimitCents / 100));
    setLimitsOpen((open) => !open);
  }

  async function handleSaveLimits() {
    await updateLimits.mutateAsync({
      perTxnLimitCents: Math.round(parseFloat(perTxn || "0") * 100),
      dailyLimitCents: Math.round(parseFloat(daily || "0") * 100),
      monthlyLimitCents: Math.round(parseFloat(monthly || "0") * 100),
    });
    setLimitsOpen(false);
  }

  const toggles = [
    {
      key: "allowOnline" as const,
      icon: ShoppingCart,
      label: "Online",
      enabled: card.allowOnline,
    },
    {
      key: "allowContactless" as const,
      icon: Wifi,
      label: "Contactless",
      enabled: card.allowContactless,
    },
    {
      key: "allowAtm" as const,
      icon: Banknote,
      label: "ATM",
      enabled: card.allowAtm,
    },
    {
      key: "allowInternational" as const,
      icon: Globe,
      label: "International",
      enabled: card.allowInternational,
    },
  ];

  return (
    <div className="space-y-12">
      <div className="max-w-[320px]">
        <CardVisual card={card} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-b border-border bg-muted/50 py-4">
        <button
          type="button"
          onClick={handleCopyNumber}
          className="rounded-xl border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
        >
          Copy number
        </button>
        <Link
          href="/transactions?filter=cards"
          className="rounded-xl border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
        >
          Transactions
        </Link>
        {(isActive || isFrozen) && (
          <button
            type="button"
            onClick={handleFreeze}
            disabled={updateStatus.isPending}
            className="flex items-center gap-2 rounded-xl border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
          >
            {updateStatus.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isFrozen ? (
              <Play className="h-3 w-3" />
            ) : (
              <Snowflake className="h-3 w-3" />
            )}
            {isFrozen ? "Unfreeze" : "Freeze"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setSecurityOpen((o) => !o)}
          className="rounded-xl border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary hover:bg-primary/20 transition-colors"
        >
          Lost or stolen
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                window.confirm("Delete this card? This cannot be undone.")
              ) {
                deleteCard.mutate(undefined, {
                  onSuccess: () => {
                    window.location.href = "/cards";
                  },
                });
              }
            }}
            disabled={deleteCard.isPending}
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
          >
            {deleteCard.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
            Delete card
          </button>
        )}
      </div>

      {securityOpen && (
        <div className="space-y-4 pb-8">
          <p className="text-sm text-foreground/90">
            Freeze the card to block new payments. Contact support if needed.
          </p>
          <div className="flex gap-6">
            {(isActive || isFrozen) && (
              <button
                type="button"
                onClick={handleFreeze}
                disabled={updateStatus.isPending || isFrozen}
                className="text-xs font-medium uppercase tracking-widest text-foreground hover:underline disabled:opacity-50"
              >
                {isFrozen ? "Frozen" : "Freeze card"}
              </button>
            )}
            <Link
              href="mailto:support@enviar.et"
              className="text-xs font-medium uppercase tracking-widest text-foreground hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-12 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Settings
          </h2>
          <div className="rounded-2xl border border-border/60 bg-card">
            {toggles.map((t, i) => (
              <button
                key={t.key}
                onClick={() => handleToggle(t.key)}
                disabled={!isActive}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm disabled:opacity-50 hover:bg-muted/30 ${
                  i < toggles.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="flex items-center gap-3">
                  <t.icon className="h-3.5 w-3.5 text-primary/70" />
                  {t.label}
                </span>
                <span
                  className={`text-xs font-medium ${t.enabled ? "text-primary" : "text-foreground/70"}`}
                >
                  {t.enabled ? "On" : "Off"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Limits
          </h2>
          <div className="rounded-2xl border border-border/60 bg-card">
            <button
              type="button"
              onClick={toggleLimitsEditor}
              disabled={!isActive}
              className="w-full text-left disabled:opacity-50 hover:bg-muted/30"
            >
              <div className="px-4 py-3">
                <LimitRow
                  label="Per transaction"
                  cents={card.perTxnLimitCents}
                />
                <LimitRow
                  label="Daily"
                  cents={card.dailyLimitCents}
                  className="mt-2"
                />
                <LimitRow
                  label="Monthly"
                  cents={card.monthlyLimitCents}
                  className="mt-2"
                />
              </div>
            </button>
            {limitsOpen && (
              <div className="border-t border-border px-4 py-4">
                <div className="space-y-4">
                  <LimitInput
                    label="Per transaction"
                    value={perTxn}
                    onChange={setPerTxn}
                  />
                  <LimitInput label="Daily" value={daily} onChange={setDaily} />
                  <LimitInput
                    label="Monthly"
                    value={monthly}
                    onChange={setMonthly}
                  />
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setLimitsOpen(false)}
                    disabled={updateLimits.isPending}
                    className="rounded-xl border border-border/60 px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground/80 hover:bg-primary/5 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveLimits}
                    disabled={updateLimits.isPending}
                    className="rounded-xl border border-primary bg-primary px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {updateLimits.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LimitRow({
  label,
  cents,
  className = "",
}: {
  label: string;
  cents: number;
  className?: string;
}) {
  const display = formatMoney(cents, "ETB", undefined, 0);
  return (
    <div className={`flex justify-between text-sm ${className}`}>
      <span className="text-foreground/70">{label}</span>
      <span className="font-tabular font-medium tabular-nums text-foreground">
        {display}
      </span>
    </div>
  );
}

function LimitInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium uppercase tracking-widest text-foreground/70">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/60">
          Br
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          className="h-10 rounded-none border-border pl-8 font-mono text-right tabular-nums"
        />
      </div>
    </div>
  );
}
