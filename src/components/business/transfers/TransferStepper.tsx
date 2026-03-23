"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Type" },
  { number: 2, label: "Recipient" },
  { number: 3, label: "Amount" },
  { number: 4, label: "Review" },
] as const;

interface TransferStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function TransferStepper({ currentStep }: TransferStepperProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-foreground text-background",
                  isActive &&
                    "bg-foreground text-background ring-4 ring-foreground/10",
                  !isCompleted && !isActive && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-5 h-px w-10 sm:w-16",
                  isCompleted ? "bg-foreground" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
