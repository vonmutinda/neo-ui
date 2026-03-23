"use client";

import type { Card, CardType } from "@/lib/types";

const TYPE_SURFACE: Record<CardType, string> = {
  virtual: "bg-neutral-800 text-white",
  physical: "bg-neutral-700 text-white",
  ephemeral: "bg-neutral-600 text-white",
};

const TYPE_LABEL: Record<CardType, string> = {
  virtual: "Virtual",
  physical: "Physical",
  ephemeral: "Disposable",
};

export function CardVisual({ card }: { card: Card; compact?: boolean }) {
  const isFrozen = card.status === "frozen";

  return (
    <div
      className={`relative flex min-h-0 flex-col overflow-hidden rounded-sm p-4 aspect-[1.586/1] w-full ${TYPE_SURFACE[card.type]}`}
    >
      {isFrozen && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <span className="text-xs font-medium tracking-widest uppercase text-white/90">
            Frozen
          </span>
        </div>
      )}

      <div className="flex shrink-0 items-start justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-white/70">
          {TYPE_LABEL[card.type]}
        </span>
      </div>

      <div className="min-h-0 flex-1 flex flex-col justify-end pt-2">
        <p className="font-mono text-sm tracking-[0.2em] text-white/95">
          ···· ···· ···· {card.lastFour}
        </p>
      </div>

      <div className="mt-2 flex shrink-0 items-end justify-between text-[10px] uppercase tracking-wider text-white/60">
        <span>
          {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
        </span>
        <span className="font-medium tracking-widest">VISA</span>
      </div>
    </div>
  );
}
