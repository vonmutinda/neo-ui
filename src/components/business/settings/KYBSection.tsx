"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const KYB_LEVELS = [
  {
    level: 1,
    title: "Basic",
    description: "Business registration verified",
  },
  {
    level: 2,
    title: "Standard",
    description: "Tax compliance verified",
  },
  {
    level: 3,
    title: "Enhanced",
    description: "Trade documentation approved",
  },
  {
    level: 4,
    title: "Full",
    description: "Complete compliance verification",
  },
];

interface KYBSectionProps {
  currentLevel: number;
}

export function KYBSection({ currentLevel }: KYBSectionProps) {
  return (
    <div className="max-w-lg">
      <h3 className="text-sm font-semibold text-foreground">
        KYB Verification
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Your business verification progress.
      </p>

      <div className="mt-6 flex flex-col gap-0">
        {KYB_LEVELS.map((item, i) => {
          const isCompleted = item.level <= currentLevel;
          const isCurrent = item.level === currentLevel + 1;
          const isFuture = item.level > currentLevel + 1;
          const isLast = i === KYB_LEVELS.length - 1;

          return (
            <div key={item.level} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isCompleted
                      ? "bg-emerald-500/10 text-emerald-600"
                      : isCurrent
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : item.level}
                </div>
                {/* Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "w-px flex-1 min-h-6",
                      isCompleted ? "bg-emerald-500/30" : "bg-muted",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("pb-6", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium leading-8",
                    isFuture ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {item.title}
                </p>
                <p
                  className={cn(
                    "text-xs",
                    isFuture
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
