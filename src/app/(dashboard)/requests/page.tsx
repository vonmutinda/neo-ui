"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSentRequests,
  useReceivedRequests,
} from "@/hooks/use-payment-requests";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

type Tab = "received" | "sent";

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const received = useReceivedRequests(30, 0);
  const sent = useSentRequests(30, 0);

  const loading = tab === "received" ? received.isLoading : sent.isLoading;
  const list = tab === "received" ? (received.data ?? []) : (sent.data ?? []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Requests" backHref="/transactions" />

      <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/40 p-1">
        {(["received", "sent"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t === "received" ? "Received" : "Sent"}
          </button>
        ))}
      </div>

      <Link
        href="/requests/new"
        className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
      >
        New request
      </Link>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && list.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No payment requests yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {list.map((r) => (
          <Link
            key={r.id}
            href={`/requests/${r.id}`}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {tab === "received"
                  ? (r.requesterName ?? "Request")
                  : (r.payerName ??
                    (r.payerPhone
                      ? `${r.payerPhone.countryCode}${r.payerPhone.number}`
                      : "Recipient"))}
              </p>
              <p className="text-xs text-muted-foreground">{r.status}</p>
            </div>
            <p className="font-tabular text-sm font-semibold">
              {formatMoney(r.amountCents, r.currencyCode as SupportedCurrency)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
