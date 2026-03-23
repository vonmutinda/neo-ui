"use client";

import { cn } from "@/lib/utils";
import { CARD_GRADIENTS } from "@/lib/business-utils";
import type { BusinessCard } from "@/lib/business-types";

interface BusinessCardVisualProps {
  card: BusinessCard;
  gradientIndex: number;
}

export function BusinessCardVisual({
  card,
  gradientIndex,
}: BusinessCardVisualProps) {
  const gradient = CARD_GRADIENTS[gradientIndex % CARD_GRADIENTS.length];
  const last4 = card.cardId.slice(-4);
  const isFrozen = !card.isActive;

  return (
    <div
      className={cn(
        "relative aspect-[1.7/1] w-full overflow-hidden rounded-2xl p-5 text-white select-none",
        gradient,
        isFrozen && "opacity-60",
      )}
    >
      {/* Chip + brand + type */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-10 rounded-md bg-white/20 backdrop-blur-sm" />
          {card.cardType && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide backdrop-blur-sm">
              {card.cardType}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold tracking-widest opacity-80">
          ENVIAR
        </span>
      </div>

      {/* Card number */}
      <p className="mt-auto pt-6 font-mono text-sm tracking-[0.2em] opacity-90">
        &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
        &bull;&bull;&bull;&bull; {last4}
      </p>

      {/* Holder + expiry */}
      <div className="mt-3 flex items-end justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide opacity-80">
            {card.memberName ?? card.label}
          </p>
        </div>
        <span className="ml-4 text-xs font-medium opacity-60">MM/YY</span>
      </div>

      {/* Frozen overlay */}
      {isFrozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
            FROZEN
          </span>
        </div>
      )}
    </div>
  );
}
