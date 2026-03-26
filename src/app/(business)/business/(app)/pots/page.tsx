"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBusinessPots,
  useCreateBusinessPot,
  useAddToBusinessPot,
  useWithdrawFromBusinessPot,
} from "@/hooks/business/use-business-pots";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { PotCard } from "@/components/business/pots/PotCard";
import { CreatePotDialog } from "@/components/business/pots/CreatePotDialog";
import { PotFundsDialog } from "@/components/business/pots/PotFundsDialog";
import { PotsSkeleton } from "@/components/business/pots/PotsSkeleton";
import type {
  BusinessPot,
  CreateBusinessPotRequest,
  PotCategory,
} from "@/lib/business-types";

type CategoryTab = "all" | PotCategory;

const CATEGORY_TABS: { value: CategoryTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "general", label: "General" },
  { value: "tax", label: "Tax" },
  { value: "petty_cash", label: "Petty Cash" },
  { value: "savings", label: "Savings" },
  { value: "event", label: "Event" },
  { value: "reserve", label: "Reserve" },
];

const PAGE_SIZE = 30;

export default function PotsPage() {
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [category, setCategory] = useState<CategoryTab>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [fundsDialog, setFundsDialog] = useState<{
    open: boolean;
    mode: "add" | "withdraw";
    pot: BusinessPot | null;
  }>({ open: false, mode: "add", pot: null });

  const filter = useMemo(
    () => ({
      category: category === "all" ? undefined : category,
      limit: PAGE_SIZE,
      offset: 0,
    }),
    [category],
  );

  const { data: result, isLoading } = useBusinessPots(activeBusinessId, filter);
  const createPot = useCreateBusinessPot(activeBusinessId);
  const addFunds = useAddToBusinessPot(activeBusinessId);
  const withdrawFunds = useWithdrawFromBusinessPot(activeBusinessId);

  const canManage = permissions?.includes("biz:pots:manage") ?? false;
  const canWithdraw = permissions?.includes("biz:pots:withdraw") ?? false;

  const currencyCode = activeBusiness?.market === "US" ? "USD" : "ETB";

  if (isLoading) return <PotsSkeleton />;

  const pots = result?.data ?? [];

  function handleCreate(req: CreateBusinessPotRequest) {
    createPot.mutate(req, {
      onSuccess: () => {
        toast.success("Pot created");
        setShowCreate(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleFundsSubmit(amountCents: number) {
    const pot = fundsDialog.pot;
    if (!pot) return;

    const mutation = fundsDialog.mode === "add" ? addFunds : withdrawFunds;
    mutation.mutate(
      { potId: pot.id, body: { amountCents } },
      {
        onSuccess: () => {
          toast.success(
            fundsDialog.mode === "add"
              ? "Funds added successfully"
              : "Funds withdrawn successfully",
          );
          setFundsDialog({ open: false, mode: "add", pot: null });
        },
        onError: (err) => toast.error(err.message),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pots"
        rightSlot={
          canManage ? (
            <button
              onClick={() => setShowCreate(true)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              New Pot
            </button>
          ) : undefined
        }
      />

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {CATEGORY_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setCategory(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              category === t.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pots grid */}
      {pots.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <PiggyBank className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No pots yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {category === "all"
              ? "Create your first pot to start setting money aside."
              : `No ${CATEGORY_TABS.find((t) => t.value === category)?.label?.toLowerCase()} pots yet.`}
          </p>
          {canManage && category === "all" && (
            <button
              onClick={() => setShowCreate(true)}
              className={cn(
                "mt-4 flex h-10 items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background",
                "transition-opacity hover:opacity-90 active:opacity-80",
              )}
            >
              <Plus className="h-4 w-4" />
              Create Pot
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pots.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              canManage={canManage || canWithdraw}
              onAddFunds={
                canManage
                  ? (p) => setFundsDialog({ open: true, mode: "add", pot: p })
                  : undefined
              }
              onWithdraw={
                canManage || canWithdraw
                  ? (p) =>
                      setFundsDialog({ open: true, mode: "withdraw", pot: p })
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreatePotDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        isSubmitting={createPot.isPending}
        defaultCurrency={currencyCode}
      />

      <PotFundsDialog
        open={fundsDialog.open}
        mode={fundsDialog.mode}
        pot={fundsDialog.pot}
        onClose={() => setFundsDialog({ open: false, mode: "add", pot: null })}
        onSubmit={handleFundsSubmit}
        isSubmitting={addFunds.isPending || withdrawFunds.isPending}
      />
    </div>
  );
}
