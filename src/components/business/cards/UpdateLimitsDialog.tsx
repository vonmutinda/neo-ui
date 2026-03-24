"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { BusinessCard } from "@/lib/business-types";

type PeriodType = "daily" | "weekly" | "monthly";

interface UpdateLimitsDialogProps {
  open: boolean;
  onClose: () => void;
  card: BusinessCard | null;
  onSubmit: (
    cardId: string,
    spendLimitCents: number,
    periodType: PeriodType,
  ) => void;
  isPending?: boolean;
}

const PERIODS: PeriodType[] = ["daily", "weekly", "monthly"];

function UpdateLimitsForm({
  card,
  onSubmit,
  isPending,
}: {
  card: BusinessCard;
  onSubmit: UpdateLimitsDialogProps["onSubmit"];
  isPending?: boolean;
}) {
  const [limitAmount, setLimitAmount] = useState(
    String(card.spendLimitCents / 100),
  );
  const [periodType, setPeriodType] = useState<PeriodType>(
    (card.periodType as PeriodType) ?? "monthly",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(limitAmount) * 100);
    if (isNaN(cents) || cents <= 0) return;
    onSubmit(card.id, cents, periodType);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 pb-4">
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Spend Limit (Br)
        </label>
        <Input
          type="number"
          min="1"
          step="0.01"
          value={limitAmount}
          onChange={(e) => setLimitAmount(e.target.value)}
          placeholder="0.00"
          className="text-lg font-semibold tabular-nums"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Reset Period
        </label>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodType(p)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                periodType === p
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!limitAmount || isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Limits"
        )}
      </Button>
    </form>
  );
}

export function UpdateLimitsDialog({
  open,
  onClose,
  card,
  onSubmit,
  isPending,
}: UpdateLimitsDialogProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Update Spend Limit</SheetTitle>
          <SheetDescription>
            {card ? `Set a new spend limit for "${card.label}".` : ""}
          </SheetDescription>
        </SheetHeader>
        {card && (
          <UpdateLimitsForm
            key={card.id}
            card={card}
            onSubmit={onSubmit}
            isPending={isPending}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
