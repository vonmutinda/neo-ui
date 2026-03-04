"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Snowflake,
  Play,
  Globe,
  Wifi,
  Banknote,
  ShoppingCart,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { CardVisual } from "@/components/cards/CardVisual";
import {
  useCard,
  useUpdateCardStatus,
  useUpdateCardToggles,
  useUpdateCardLimits,
} from "@/hooks/use-cards";
import { useTelegram } from "@/providers/TelegramProvider";
import { Input } from "@/components/ui/input";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { haptic } = useTelegram();
  const { data: card, isLoading } = useCard(id);
  const updateStatus = useUpdateCardStatus(id);
  const updateToggles = useUpdateCardToggles(id);
  const updateLimits = useUpdateCardLimits(id);

  const [limitsOpen, setLimitsOpen] = useState(false);
  const [perTxn, setPerTxn] = useState("");
  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">Card not found</p>
        <Button variant="outline" onClick={() => router.push("/cards")}>
          Back to Cards
        </Button>
      </div>
    );
  }

  const isFrozen = card.status === "frozen";
  const isActive = card.status === "active";

  async function handleFreeze() {
    haptic("medium");
    await updateStatus.mutateAsync({
      status: isFrozen ? "active" : "frozen",
    });
    haptic("heavy");
  }

  async function handleToggle(
    field: "allowOnline" | "allowContactless" | "allowAtm" | "allowInternational",
  ) {
    if (!card) return;
    haptic("light");
    await updateToggles.mutateAsync({ [field]: !card[field] });
  }

  function openLimitsSheet() {
    if (!card) return;
    setPerTxn(String(card.perTxnLimitCents / 100));
    setDaily(String(card.dailyLimitCents / 100));
    setMonthly(String(card.monthlyLimitCents / 100));
    setLimitsOpen(true);
  }

  async function handleSaveLimits() {
    haptic("medium");
    await updateLimits.mutateAsync({
      perTxnLimitCents: Math.round(parseFloat(perTxn || "0") * 100),
      dailyLimitCents: Math.round(parseFloat(daily || "0") * 100),
      monthlyLimitCents: Math.round(parseFloat(monthly || "0") * 100),
    });
    setLimitsOpen(false);
    haptic("heavy");
  }

  const toggles = [
    {
      key: "allowOnline" as const,
      icon: ShoppingCart,
      label: "Online payments",
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
      label: "ATM withdrawals",
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cards"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Card Details</h1>
      </div>

      {/* Card visual */}
      <CardVisual card={card} />

      {/* Freeze / Unfreeze */}
      {(isActive || isFrozen) && (
        <Button
          variant={isFrozen ? "default" : "outline"}
          size="lg"
          onClick={handleFreeze}
          disabled={updateStatus.isPending}
          className="h-14 text-base font-semibold"
        >
          {updateStatus.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : isFrozen ? (
            <Play className="mr-2 h-5 w-5" />
          ) : (
            <Snowflake className="mr-2 h-5 w-5" />
          )}
          {isFrozen ? "Unfreeze Card" : "Freeze Card"}
        </Button>
      )}

      {/* Channel toggles */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Payment Channels
        </h3>
        <div className="overflow-hidden rounded-2xl border bg-card">
          {toggles.map((t, i) => (
            <button
              key={t.key}
              onClick={() => handleToggle(t.key)}
              disabled={!isActive}
              className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors active:bg-muted disabled:opacity-50 ${
                i < toggles.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <t.icon className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{t.label}</span>
              <div
                className={`h-6 w-11 rounded-full transition-colors ${
                  t.enabled ? "bg-primary" : "bg-muted"
                } relative`}
              >
                <motion.div
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
                  animate={{ left: t.enabled ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Spending limits */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Spending Limits
        </h3>
        <button
          onClick={openLimitsSheet}
          disabled={!isActive}
          className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-4 transition-colors active:bg-muted disabled:opacity-50"
        >
          <div className="space-y-2 text-left">
            <LimitRow
              label="Per transaction"
              cents={card.perTxnLimitCents}
            />
            <LimitRow label="Daily" cents={card.dailyLimitCents} />
            <LimitRow label="Monthly" cents={card.monthlyLimitCents} />
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Limits sheet */}
      <Sheet open={limitsOpen} onOpenChange={setLimitsOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Spending Limits</SheetTitle>
            <SheetDescription>
              Set maximum amounts in ETB for each limit type
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-4">
            <LimitInput
              label="Per transaction"
              value={perTxn}
              onChange={setPerTxn}
            />
            <LimitInput label="Daily limit" value={daily} onChange={setDaily} />
            <LimitInput
              label="Monthly limit"
              value={monthly}
              onChange={setMonthly}
            />
            <Button
              size="lg"
              onClick={handleSaveLimits}
              disabled={updateLimits.isPending}
              className="mt-2 h-14 w-full text-base font-semibold"
            >
              {updateLimits.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Save Limits"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LimitRow({ label, cents }: { label: string; cents: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-tabular font-medium">
        Br {(cents / 100).toLocaleString()}
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
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Br
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ""))}
          className="h-12 pl-10 text-right font-tabular text-lg"
        />
      </div>
    </div>
  );
}
