"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImportStatus } from "@/lib/business-types";

interface ImportTimelineProps {
  currentStatus: ImportStatus;
}

const STEPS: { key: ImportStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "submitted", label: "Submitted" },
  { key: "bank_reviewing", label: "Bank Review" },
  { key: "forex_allocated", label: "FX Allocated" },
  { key: "payment_pending", label: "Payment" },
  { key: "shipped", label: "Shipped" },
  { key: "customs_clearing", label: "Customs" },
  { key: "completed", label: "Done" },
];

const STATUS_ORDER: ImportStatus[] = [
  "draft",
  "submitted",
  "bank_reviewing",
  "forex_allocated",
  "payment_pending",
  "shipped",
  "customs_clearing",
  "completed",
];

function getStepIndex(status: ImportStatus): number {
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? -1 : idx;
}

export function ImportTimeline({ currentStatus }: ImportTimelineProps) {
  const isTerminal =
    currentStatus === "rejected" || currentStatus === "cancelled";
  const activeIdx = isTerminal ? -1 : getStepIndex(currentStatus);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center gap-0 min-w-[600px]">
        {STEPS.map((step, i) => {
          const isCompleted = !isTerminal && activeIdx > i;
          const isActive = !isTerminal && activeIdx === i;
          const isFuture = isTerminal || activeIdx < i;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isCompleted && "bg-foreground text-background",
                    isActive &&
                      "bg-foreground text-background ring-2 ring-foreground/20 ring-offset-2 ring-offset-background",
                    isFuture && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px flex-1",
                    isCompleted ? "bg-foreground" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal status indicator */}
      {isTerminal && (
        <p className="mt-3 text-center text-xs font-semibold text-destructive">
          {currentStatus === "rejected" ? "Rejected" : "Cancelled"}
        </p>
      )}
    </div>
  );
}
