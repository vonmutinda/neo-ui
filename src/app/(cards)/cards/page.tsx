"use client";

import { CreditCard } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function CardsPage() {
  const { data: cards, isLoading, error } = useCards();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cards" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cards" />
        <EmptyState
          icon={CreditCard}
          title="Failed to load cards"
          description="Try refreshing the page."
        />
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cards" />
        <EmptyState
          icon={CreditCard}
          title="No cards yet"
          description="Add a card to start making payments."
          actionLabel="Add your first card"
          actionHref="/cards/new"
        />
      </div>
    );
  }

  return null;
}
