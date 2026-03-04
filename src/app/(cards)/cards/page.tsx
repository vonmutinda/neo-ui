"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, CreditCard, Smartphone, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCards, useCreateCard } from "@/hooks/use-cards";
import { CardVisual } from "@/components/cards/CardVisual";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CardType } from "@/lib/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  frozen: "secondary",
  cancelled: "destructive",
  expired: "destructive",
  pending_activation: "outline",
};

const CARD_TYPES: {
  type: CardType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    type: "virtual",
    label: "Virtual Card",
    description: "Instant card for online payments. Available immediately.",
    icon: Smartphone,
  },
  {
    type: "physical",
    label: "Physical Card",
    description: "Delivered to your address. Works at any ATM or POS.",
    icon: CreditCard,
  },
  {
    type: "ephemeral",
    label: "Disposable Card",
    description: "Single-use card that expires after one transaction.",
    icon: Zap,
  },
];

export default function CardsPage() {
  const { data: cards, isLoading, error } = useCards();
  const createCard = useCreateCard();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CardType>("virtual");

  function handleCreate() {
    createCard.mutate(
      { type: selectedType, allowOnline: true, allowContactless: true },
      { onSuccess: () => setSheetOpen(false) },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">My Cards</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Card
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-52 w-full rounded-2xl" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive">Failed to load cards</p>
        </div>
      )}

      {cards && cards.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No cards yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a virtual or physical card to get started
            </p>
          </div>
          <Button className="mt-2" onClick={() => setSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Card
          </Button>
        </div>
      )}

      {cards && cards.length > 0 && (
        <div className="space-y-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={`/cards/${card.id}`} className="block">
                <CardVisual card={card} compact />
                <div className="mt-2 flex items-center justify-between rounded-xl bg-muted dark:bg-card dark:border dark:border-border px-3 py-2">
                  <span className="text-sm text-muted-foreground">
                    •••• {card.lastFour}
                  </span>
                  <Badge variant={STATUS_VARIANT[card.status] ?? "outline"}>
                    {card.status.replace("_", " ")}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* New card sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8">
          <SheetHeader className="px-5 pb-2 pt-5">
            <SheetTitle>Create a card</SheetTitle>
            <SheetDescription>
              Choose the type of card you want to create.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-5 py-3">
            {CARD_TYPES.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors active:bg-muted/60",
                  selectedType === type
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    selectedType === type
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
                </div>
                <div
                  className={cn(
                    "ml-auto mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-colors",
                    selectedType === type
                      ? "border-primary bg-primary"
                      : "border-border",
                  )}
                />
              </button>
            ))}
          </div>

          <SheetFooter className="px-5 pt-2">
            <Button
              className="h-14 w-full rounded-[10px] text-base font-semibold"
              onClick={handleCreate}
              disabled={createCard.isPending}
            >
              {createCard.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Create ${selectedType} card`
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
