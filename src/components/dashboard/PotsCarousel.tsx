"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Pot } from "@/lib/types";

interface PotsCarouselProps {
  pots: Pot[];
  allPotsCount: number;
}

export function PotsCarousel({ pots }: PotsCarouselProps) {
  return (
    <div
      className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 pt-0"
      style={{ scrollbarWidth: "none" }}
    >
      {pots.map((pot) => {
        const progress = pot.progressPercent ?? 0;
        return (
          <Link
            key={pot.id}
            href={`/pots/${pot.id}`}
            className="flex w-28 min-w-[7rem] shrink-0 flex-col items-center gap-1 rounded-xl border border-border/60 bg-card p-3 transition-all active:scale-[0.97] hover:bg-primary/5"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg">
              {pot.emoji ?? "🏦"}
              {pot.targetCents ? (
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-border/40"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - Math.min(progress, 100) / 100)}`}
                    className="text-primary transition-all"
                  />
                </svg>
              ) : null}
            </div>
            <span className="w-full truncate text-center text-[10px] font-medium text-foreground">
              {pot.name}
            </span>
            <span className="font-tabular text-[10px] text-muted-foreground">
              {pot.display}
            </span>
          </Link>
        );
      })}
      <Link
        href="/pots/new"
        className="flex w-28 min-w-[7rem] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/60 bg-muted/30 p-3 transition-all active:scale-[0.97] hover:bg-muted/50"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-center text-xs font-medium text-muted-foreground">
          New pot
        </p>
      </Link>
    </div>
  );
}
