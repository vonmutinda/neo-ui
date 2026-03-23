"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatMoney } from "@/lib/format";
import {
  getTransferStatusColor,
  getTransferStatusLabel,
  formatTransferRecipient,
} from "@/lib/business-utils";
import { cn } from "@/lib/utils";
import type { BusinessTransfer } from "@/lib/business-types";

interface BusinessRecentTransfersProps {
  transfers: BusinessTransfer[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function BusinessRecentTransfers({
  transfers,
}: BusinessRecentTransfersProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-background",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-base font-semibold tracking-tight">Recent</h2>
        <Link
          href="/business/transfers"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-border/60">
            <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Recipient
            </th>
            <th className="px-6 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Amount
            </th>
            <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Status
            </th>
            <th className="px-6 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((t) => (
            <tr
              key={t.id}
              className="cursor-pointer border-b border-border/40 last:border-b-0 transition-colors hover:bg-secondary/30"
            >
              <td className="px-6 py-4 text-sm">
                {formatTransferRecipient(t)}
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm font-medium tracking-tight">
                {formatMoney(t.amountCents, t.currencyCode, undefined, 0)}
              </td>
              <td className="px-6 py-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    getTransferStatusColor(t.status),
                  )}
                >
                  {getTransferStatusLabel(t.status)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">
                {formatDate(t.createdAt)}
              </td>
            </tr>
          ))}
          {transfers.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-center text-sm text-muted-foreground"
              >
                No transfers yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
