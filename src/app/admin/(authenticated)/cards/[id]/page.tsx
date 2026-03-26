"use client";

import { use } from "react";
import Link from "next/link";
import {
  useAdminCard,
  useAdminCardAuthorizations,
} from "@/hooks/admin/use-admin-cards";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: card, isLoading } = useAdminCard(id);
  const { data: authData, isLoading: authLoading } = useAdminCardAuthorizations(
    id,
    { limit: 20 },
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <p className="py-12 text-center text-muted-foreground">Card not found</p>
    );
  }

  const authorizations = authData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/cards">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold font-mono">{card.id}</h2>
          <p className="text-sm text-muted-foreground">
            User ID: {card.userId}
          </p>
        </div>
        <StatusBadge status={card.type} />
        <StatusBadge status={card.status} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
          Card Info
        </h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Last Four</dt>
            <dd className="font-tabular text-lg font-semibold">
              ****{card.lastFour}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Expiry</dt>
            <dd className="text-sm">
              {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Daily Limit</dt>
            <dd className="font-tabular">
              {((card.dailyLimitCents ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Monthly Limit</dt>
            <dd className="font-tabular">
              {((card.monthlyLimitCents ?? 0) / 100).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Online</dt>
            <dd className="text-sm">{card.allowOnline ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">ATM</dt>
            <dd className="text-sm">{card.allowAtm ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">International</dt>
            <dd className="text-sm">
              {card.allowInternational ? "Yes" : "No"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Created</dt>
            <dd className="text-sm">
              {new Date(card.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
          Authorization History
        </h3>
        {authLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : authorizations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No authorizations yet
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Merchant</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {authorizations.map((auth) => (
                  <tr
                    key={auth.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{auth.merchantName || "—"}</td>
                    <td className="px-4 py-3 font-tabular">
                      {((auth.authAmountCents ?? 0) / 100).toLocaleString(
                        undefined,
                        { minimumFractionDigits: 2 },
                      )}{" "}
                      {auth.currency}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={auth.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(auth.authorizedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
