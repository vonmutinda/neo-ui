"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import { useCards } from "@/hooks/use-cards";
import { CardVisual } from "@/components/cards/CardVisual";
import { Skeleton } from "@/components/ui/skeleton";
import type { Card, CardType } from "@/lib/types";

const TYPE_ORDER: CardType[] = ["physical", "virtual", "ephemeral"];
const TYPE_LABEL: Record<CardType, string> = {
  physical: "Physical",
  virtual: "Virtual",
  ephemeral: "Disposable",
};

function CardThumbnail({ card, selected }: { card: Card; selected: boolean }) {
  return (
    <Link
      href={`/cards/${card.id}`}
      className={`block py-2 transition-colors ${
        selected
          ? "border-l-2 border-primary bg-primary/5 pl-3"
          : "border-l-2 border-transparent pl-3 hover:bg-muted/40"
      }`}
    >
      <div className="w-full max-w-[140px] aspect-[1.586/1] overflow-hidden rounded-sm">
        <CardVisual card={card} compact />
      </div>
    </Link>
  );
}

export default function CardsBrowserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: cards, isLoading, error } = useCards();
  const selectedId = pathname?.match(/^\/cards\/([^/]+)$/)?.[1] ?? null;

  useEffect(() => {
    if (pathname === "/cards" && cards && cards.length > 0) {
      router.replace(`/cards/${cards[0].id}`);
    }
  }, [pathname, cards, router]);

  if (pathname === "/cards" && cards && cards.length > 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
        <div className="space-y-8">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-4">
            <Skeleton className="aspect-[1.586/1] w-full max-w-[140px] rounded-sm" />
            <Skeleton className="aspect-[1.586/1] w-full max-w-[140px] rounded-sm" />
          </div>
        </div>
        <div className="min-w-0">
          <Skeleton className="aspect-[1.586/1] w-full max-w-[320px] rounded-sm" />
          <Skeleton className="mt-8 h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !cards || cards.length === 0) {
    return <>{children}</>;
  }

  const groupedByType: { type: CardType; label: string; cards: Card[] }[] = [];
  for (const type of TYPE_ORDER) {
    const list = cards.filter((c) => c.type === type);
    if (list.length > 0)
      groupedByType.push({ type, label: TYPE_LABEL[type], cards: list });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Cards</h1>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[220px_1fr] md:gap-16">
        <aside className="min-w-0">
          <nav className="space-y-6" aria-label="Cards">
            {groupedByType.map(({ type, label, cards: typeCards }) => (
              <div key={type}>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-foreground/70">
                  {label}
                </p>
                <div className="space-y-1">
                  {typeCards.map((card) => (
                    <CardThumbnail
                      key={card.id}
                      card={card}
                      selected={selectedId === card.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-6 pt-6 border-t border-border/60">
            <Link
              href="/cards/new"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add card
            </Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
