"use client";

import { Snowflake, Sun, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessCardVisual } from "./BusinessCardVisual";
import { CardSpendMeter } from "./CardSpendMeter";
import type { BusinessCard } from "@/lib/business-types";

interface BusinessCardGridProps {
  cards: BusinessCard[];
  canManage: boolean;
  onFreeze: (cardId: string) => void;
  onUnfreeze: (cardId: string) => void;
  onUpdateLimits: (card: BusinessCard) => void;
}

export function BusinessCardGrid({
  cards,
  canManage,
  onFreeze,
  onUnfreeze,
  onUpdateLimits,
}: BusinessCardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">No cards issued yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {cards.map((card, i) => (
        <div
          key={card.id}
          className="flex flex-col gap-3 rounded-2xl bg-background p-4 shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)] transition-all hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px"
        >
          <BusinessCardVisual card={card} gradientIndex={i} />

          {/* Info */}
          <div className="flex flex-col gap-1 px-1">
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <p className="text-xs text-muted-foreground">
              {card.memberName ?? "Team member"}
            </p>
          </div>

          {/* Spend meter */}
          <div className="px-1">
            <CardSpendMeter card={card} />
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex items-center gap-2 px-1 pt-1">
              {card.isActive ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => onFreeze(card.id)}
                >
                  <Snowflake className="mr-1.5 h-3.5 w-3.5" />
                  Freeze
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={() => onUnfreeze(card.id)}
                >
                  <Sun className="mr-1.5 h-3.5 w-3.5" />
                  Unfreeze
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                onClick={() => onUpdateLimits(card)}
              >
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                Limits
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
