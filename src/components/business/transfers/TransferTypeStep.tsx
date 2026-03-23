"use client";

import { User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBusinessTransferStore } from "@/lib/business-transfer-store";
import type { BusinessTransferType } from "@/lib/business-types";

const TYPE_CARDS: {
  type: BusinessTransferType;
  icon: typeof User;
  title: string;
  description: string;
}[] = [
  {
    type: "internal",
    icon: User,
    title: "Internal Transfer",
    description: "Send to an Enviar user",
  },
  {
    type: "external",
    icon: Building2,
    title: "External Transfer",
    description: "Send to a bank account",
  },
];

export function TransferTypeStep() {
  const { transferType, setTransferType, setStep } = useBusinessTransferStore();

  function handleSelect(type: BusinessTransferType) {
    setTransferType(type);
    setStep(2);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Choose transfer type</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          How do you want to send money?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TYPE_CARDS.map((card) => {
          const Icon = card.icon;
          const isSelected = transferType === card.type;

          return (
            <button
              key={card.type}
              onClick={() => handleSelect(card.type)}
              className={cn(
                "flex flex-col items-center gap-4 rounded-2xl p-8 text-center transition-all",
                "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
                "hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
                isSelected && "ring-2 ring-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
