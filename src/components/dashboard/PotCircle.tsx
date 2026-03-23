"use client";

import Link from "next/link";
import type { Pot } from "@/lib/types";

interface PotCircleProps {
  pot: Pot;
}

export function PotCircle({ pot }: PotCircleProps) {
  return (
    <Link
      href={`/pots/${pot.id}`}
      className="flex shrink-0 flex-col items-center gap-1.5 transition-opacity hover:opacity-90 active:opacity-80"
      title={pot.name}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card text-xl transition-colors hover:bg-primary/5">
        {pot.emoji ?? "🏦"}
      </div>
      <span className="max-w-[4rem] truncate text-center text-[10px] font-medium text-foreground/80">
        {pot.name}
      </span>
    </Link>
  );
}
