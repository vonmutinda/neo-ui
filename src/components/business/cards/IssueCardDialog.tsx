"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  BusinessMember,
  BusinessCardType,
  IssueBusinessCardRequest,
} from "@/lib/business-types";

interface IssueCardDialogProps {
  open: boolean;
  onClose: () => void;
  members: BusinessMember[];
  onSubmit: (req: IssueBusinessCardRequest) => void;
  isSubmitting?: boolean;
}

export function IssueCardDialog({
  open,
  onClose,
  members,
  onSubmit,
  isSubmitting,
}: IssueCardDialogProps) {
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [cardType, setCardType] = useState<BusinessCardType>("virtual");
  const [limitAmount, setLimitAmount] = useState("");
  const [periodType, setPeriodType] = useState<"daily" | "weekly" | "monthly">(
    "monthly",
  );

  function handleClose() {
    setMemberId(members[0]?.id ?? "");
    setLabel("");
    setCardType("virtual");
    setLimitAmount("");
    setPeriodType("monthly");
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(parseFloat(limitAmount) * 100);
    if (!memberId || !label.trim() || isNaN(cents) || cents <= 0) return;
    onSubmit({
      memberId,
      label: label.trim(),
      cardType,
      spendLimitCents: cents,
      periodType,
    });
  }

  if (!open) return null;

  const activeMembers = members.filter((m) => m.isActive);
  const isValid =
    memberId &&
    label.trim() &&
    limitAmount &&
    !isNaN(parseFloat(limitAmount)) &&
    parseFloat(limitAmount) > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Issue New Card
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Issue a physical or virtual card for a team member.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Card Type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Card Type
            </label>
            <div className="flex gap-2">
              {(["virtual", "physical"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCardType(type)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    cardType === type
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {type === "virtual" ? "Virtual" : "Physical"}
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Team Member
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="h-10 w-full rounded-lg bg-muted/50 px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted"
              required
            >
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title ?? m.userId}
                  {m.role ? ` (${m.role.name})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Label */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Card Label
            </label>
            <Input
              type="text"
              placeholder="e.g. Marketing Expenses"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          {/* Spend limit */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Spend Limit (Br)
            </label>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="50,000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              required
            />
          </div>

          {/* Period */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Reset Period
            </label>
            <select
              value={periodType}
              onChange={(e) =>
                setPeriodType(e.target.value as "daily" | "weekly" | "monthly")
              }
              className="h-10 w-full rounded-lg bg-muted/50 px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Issue Card
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
