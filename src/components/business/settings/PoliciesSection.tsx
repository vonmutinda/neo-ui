"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

const POLICIES = [
  { label: "Transfer Threshold", value: "Br 50,000", isToggle: false },
  { label: "Batch Approval", value: true, isToggle: true },
  { label: "FX Conversion Approval", value: true, isToggle: true },
  { label: "Card Issuance", value: true, isToggle: true },
  { label: "Daily Limit", value: "Br 2,000,000", isToggle: false },
  { label: "Dual Approval", value: false, isToggle: true },
] as const;

export function PoliciesSection() {
  return (
    <div className="max-w-lg">
      <h3 className="text-sm font-semibold text-foreground">
        Approval Policies
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Controls and thresholds for your business.
      </p>

      <div className="mt-5 flex flex-col gap-0">
        {POLICIES.map((policy) => (
          <div
            key={policy.label}
            className="flex items-center justify-between py-3.5"
          >
            <span className="text-sm text-foreground">{policy.label}</span>
            {policy.isToggle ? (
              <ToggleIndicator on={policy.value as boolean} />
            ) : (
              <span className="font-mono text-sm font-medium tracking-tight text-foreground">
                {policy.value as string}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-muted/50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Approval policy management coming soon. Contact support to adjust
          thresholds.
        </p>
      </div>
    </div>
  );
}

function ToggleIndicator({ on }: { on: boolean }) {
  return (
    <div
      className={cn(
        "flex h-6 w-10 items-center rounded-full p-0.5 transition-colors",
        on ? "bg-foreground" : "bg-muted",
      )}
    >
      <div
        className={cn(
          "h-5 w-5 rounded-full bg-background shadow-sm transition-transform",
          on ? "translate-x-4" : "translate-x-0",
        )}
      />
    </div>
  );
}
