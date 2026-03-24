"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessCardGrid } from "@/components/business/cards/BusinessCardGrid";
import { IssueCardDialog } from "@/components/business/cards/IssueCardDialog";
import { UpdateLimitsDialog } from "@/components/business/cards/UpdateLimitsDialog";
import { CardsSkeleton } from "@/components/business/cards/CardsSkeleton";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBusinessCards,
  useIssueCard,
  useFreezeCard,
  useUnfreezeCard,
  useUpdateCardLimits,
} from "@/hooks/business/use-business-cards";
import {
  useBusinessMembers,
  useMyPermissions,
} from "@/hooks/business/use-business-members";
import type { BusinessCard } from "@/lib/business-types";

export default function CardsPage() {
  const { activeBusinessId } = useBusinessStore();
  const bizId = activeBusinessId;

  const { data: cardsData, isLoading: cardsLoading } = useBusinessCards(bizId);
  const { data: members, isLoading: membersLoading } =
    useBusinessMembers(bizId);
  const { data: myPermissions } = useMyPermissions(bizId);

  const issueCardMutation = useIssueCard(bizId);
  const freezeMutation = useFreezeCard(bizId);
  const unfreezeMutation = useUnfreezeCard(bizId);
  const updateLimitsMutation = useUpdateCardLimits(bizId);

  const [issueOpen, setIssueOpen] = useState(false);
  const [limitsCard, setLimitsCard] = useState<BusinessCard | null>(null);

  const canManage = myPermissions?.includes("biz:cards:manage") ?? false;

  if (cardsLoading || membersLoading) {
    return <CardsSkeleton />;
  }

  const cards = cardsData?.data ?? [];
  const activeCount = cards.filter((c) => c.isActive).length;
  const frozenCount = cards.filter((c) => !c.isActive).length;

  function handleFreeze(cardId: string) {
    freezeMutation.mutate(cardId, {
      onSuccess: () => toast.success("Card frozen"),
      onError: () => toast.error("Failed to freeze card"),
    });
  }

  function handleUnfreeze(cardId: string) {
    unfreezeMutation.mutate(cardId, {
      onSuccess: () => toast.success("Card unfrozen"),
      onError: () => toast.error("Failed to unfreeze card"),
    });
  }

  function handleUpdateLimits(card: BusinessCard) {
    setLimitsCard(card);
  }

  function handleLimitsSubmit(
    cardId: string,
    spendLimitCents: number,
    periodType: "daily" | "weekly" | "monthly",
  ) {
    updateLimitsMutation.mutate(
      { cardId, body: { spendLimitCents, periodType } },
      {
        onSuccess: () => {
          toast.success("Limits updated");
          setLimitsCard(null);
        },
        onError: () => toast.error("Failed to update limits"),
      },
    );
  }

  const subtitle = [
    activeCount > 0 ? `${activeCount} active` : null,
    frozenCount > 0 ? `${frozenCount} frozen` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Cards"
        rightSlot={
          canManage ? (
            <Button size="sm" onClick={() => setIssueOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Issue Card
            </Button>
          ) : undefined
        }
      />

      {subtitle && (
        <p className="-mt-4 text-sm text-muted-foreground">{subtitle}</p>
      )}

      <BusinessCardGrid
        cards={cards}
        canManage={canManage}
        onFreeze={handleFreeze}
        onUnfreeze={handleUnfreeze}
        onUpdateLimits={handleUpdateLimits}
      />

      <IssueCardDialog
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        members={members ?? []}
        onSubmit={(req) => {
          issueCardMutation.mutate(req, {
            onSuccess: () => {
              toast.success("Card issued");
              setIssueOpen(false);
            },
            onError: () => toast.error("Failed to issue card"),
          });
        }}
        isSubmitting={issueCardMutation.isPending}
      />

      <UpdateLimitsDialog
        open={!!limitsCard}
        onClose={() => setLimitsCard(null)}
        card={limitsCard}
        onSubmit={handleLimitsSubmit}
        isPending={updateLimitsMutation.isPending}
      />
    </div>
  );
}
