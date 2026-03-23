"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Smartphone, Zap, Loader2 } from "lucide-react";
import { useCreateCard } from "@/hooks/use-cards";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CardType } from "@/lib/types";

const CARD_TYPES: {
  type: CardType;
  label: string;
  description: string;
  helperLine: string;
  icon: React.ElementType;
}[] = [
  {
    type: "virtual",
    label: "Virtual Card",
    description: "Instant card for online payments. Available immediately.",
    helperLine: "Use instantly for online checkout.",
    icon: Smartphone,
  },
  {
    type: "physical",
    label: "Physical Card",
    description: "Delivered to your address. Works at any ATM or POS.",
    helperLine: "We'll deliver to your address. Delivery in 5–7 business days.",
    icon: CreditCard,
  },
  {
    type: "ephemeral",
    label: "Disposable Card",
    description: "Single-use card that expires after one transaction.",
    helperLine: "Use once, then it's invalidated for security.",
    icon: Zap,
  },
];

export default function NewCardPage() {
  const router = useRouter();
  const createCard = useCreateCard();
  const [selectedType, setSelectedType] = useState<CardType>("virtual");

  function handleCreate() {
    createCard.mutate(
      { type: selectedType, allowOnline: true, allowContactless: true },
      { onSuccess: (card) => router.push(`/cards/${card.id}`) },
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold text-foreground">Create a card</h1>

      <p className="text-sm text-foreground/80">
        Choose the type of card you want to create.
      </p>

      <div className="space-y-3">
        {CARD_TYPES.map(
          ({ type, label, description, helperLine, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-colors",
                selectedType === type
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/80 text-foreground/70",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs text-foreground/75">
                  {description}
                </p>
                {selectedType === type && (
                  <p className="mt-1.5 text-xs text-foreground/70">
                    {helperLine}
                  </p>
                )}
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
          ),
        )}
      </div>

      <Button
        size="lg"
        className="w-full rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        onClick={handleCreate}
        disabled={createCard.isPending}
      >
        {createCard.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          `Create ${selectedType} card`
        )}
      </Button>
    </div>
  );
}
