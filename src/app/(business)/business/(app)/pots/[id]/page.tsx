"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { getTaxTypeLabel } from "@/lib/business-utils";
import {
  ArrowLeft,
  ArrowUpToLine,
  ArrowDownToLine,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBusinessPot,
  useBusinessPotTransactions,
  useArchiveBusinessPot,
  useAddToBusinessPot,
  useWithdrawFromBusinessPot,
} from "@/hooks/business/use-business-pots";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PotFundsDialog } from "@/components/business/pots/PotFundsDialog";

export default function PotDetailPage() {
  const router = useRouter();
  const { id: potId } = useParams<{ id: string }>();
  const { activeBusinessId } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const { data: pot, isLoading } = useBusinessPot(activeBusinessId, potId);
  const { data: transactions } = useBusinessPotTransactions(
    activeBusinessId,
    potId,
    50,
  );

  const archivePot = useArchiveBusinessPot(activeBusinessId);
  const addFunds = useAddToBusinessPot(activeBusinessId);
  const withdrawFunds = useWithdrawFromBusinessPot(activeBusinessId);

  const [fundsDialog, setFundsDialog] = useState<{
    open: boolean;
    mode: "add" | "withdraw";
  }>({ open: false, mode: "add" });

  const canManage = permissions?.includes("biz:pots:manage") ?? false;
  const canWithdraw = permissions?.includes("biz:pots:withdraw") ?? false;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded-lg bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }

  if (!pot) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Pot not found</p>
        <button
          onClick={() => router.push("/business/pots")}
          className="mt-4 text-sm font-medium text-foreground underline"
        >
          Back to Pots
        </button>
      </div>
    );
  }

  const targetCents = pot.targetCents ?? 0;
  const progressPct =
    targetCents > 0
      ? Math.min(100, Math.round((pot.balanceCents / targetCents) * 100))
      : 0;

  function handleArchive() {
    if (
      !confirm(
        "Archive this pot? Any remaining funds will be returned to your main balance.",
      )
    )
      return;
    archivePot.mutate(potId, {
      onSuccess: (result) => {
        if (result?.fundsReturned) {
          toast.success(
            `Pot archived. ${result.display} returned to main balance.`,
          );
        } else {
          toast.success("Pot archived");
        }
        router.push("/business/pots");
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleFundsSubmit(amountCents: number) {
    const mutation = fundsDialog.mode === "add" ? addFunds : withdrawFunds;
    mutation.mutate(
      { potId, body: { amountCents } },
      {
        onSuccess: () => {
          toast.success(
            fundsDialog.mode === "add" ? "Funds added" : "Funds withdrawn",
          );
          setFundsDialog({ open: false, mode: "add" });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => router.push("/business/pots")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pots
      </button>

      {/* Pot header card */}
      <div
        className={cn(
          "rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {pot.emoji && <span className="text-2xl">{pot.emoji}</span>}
              <h1 className="text-xl font-semibold text-foreground">
                {pot.name}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {pot.category.replace("_", " ")}
              {pot.category === "tax" &&
                pot.taxDetails?.taxType &&
                ` · ${getTaxTypeLabel(pot.taxDetails.taxType)}`}
            </p>
          </div>

          {/* Actions */}
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={handleArchive}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium",
                  "bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20",
                )}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            </div>
          )}
        </div>

        {/* Balance */}
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Balance
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight">
            {pot.display || formatMoney(pot.balanceCents, pot.currencyCode)}
          </p>

          {targetCents > 0 && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                of {formatMoney(targetCents, pot.currencyCode)} target ·{" "}
                {progressPct}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    progressPct >= 100
                      ? "bg-success-foreground"
                      : progressPct >= 75
                        ? "bg-warning-foreground"
                        : "bg-foreground",
                  )}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Tax details */}
        {pot.category === "tax" && pot.taxDetails && (
          <div className="mt-6 flex gap-6 border-t pt-4">
            {pot.taxDetails.dueDate && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Due Date
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {new Date(pot.taxDetails.dueDate).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            )}
            {pot.taxDetails.notes && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Notes
                </p>
                <p className="mt-0.5 text-sm">{pot.taxDetails.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Fund action buttons */}
        {(canManage || canWithdraw) && (
          <div className="mt-6 flex gap-3">
            {canManage && (
              <button
                onClick={() => setFundsDialog({ open: true, mode: "add" })}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium",
                  "bg-foreground text-background transition-opacity hover:opacity-90",
                )}
              >
                <ArrowUpToLine className="h-4 w-4" />
                Add Funds
              </button>
            )}
            {(canManage || canWithdraw) && pot.balanceCents > 0 && (
              <button
                onClick={() => setFundsDialog({ open: true, mode: "withdraw" })}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium",
                  "bg-muted transition-colors hover:bg-muted/80",
                )}
              >
                <ArrowDownToLine className="h-4 w-4" />
                Withdraw
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction history */}
      <div
        className={cn(
          "rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
      >
        <h2 className="text-sm font-semibold text-foreground">
          Transaction History
        </h2>

        {!transactions || transactions.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No transactions yet
          </p>
        ) : (
          <div className="mt-4 divide-y">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <p
                  className={cn(
                    "font-mono text-sm font-semibold",
                    tx.amountCents > 0
                      ? "text-success-foreground"
                      : "text-destructive",
                  )}
                >
                  {formatMoney(
                    Math.abs(tx.amountCents),
                    tx.currency,
                    tx.amountCents > 0,
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Funds dialog */}
      <PotFundsDialog
        open={fundsDialog.open}
        mode={fundsDialog.mode}
        pot={pot}
        onClose={() => setFundsDialog({ open: false, mode: "add" })}
        onSubmit={handleFundsSubmit}
        isSubmitting={addFunds.isPending || withdrawFunds.isPending}
      />
    </div>
  );
}
