"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  HandCoins,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  Bell,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useReceivedRequests,
  useSentRequests,
  usePendingRequestCount,
  usePayRequest,
  useDeclineRequest,
  useCancelRequest,
  useRemindRequest,
} from "@/hooks/use-payment-requests";
import { formatMoney } from "@/lib/format";
import type { PaymentRequest, PaymentRequestStatus } from "@/lib/types";

type Tab = "received" | "sent";

const STATUS_CONFIG: Record<
  PaymentRequestStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  paid: { label: "Paid", className: "bg-success/10 text-success" },
  declined: { label: "Declined", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
  expired: { label: "Expired", className: "bg-muted text-muted-foreground" },
};

function ReceivedRequestRow({ req }: { req: PaymentRequest }) {
  const pay = usePayRequest();
  const decline = useDeclineRequest();

  return (
    <div className="flex items-center gap-3">
      <Link href={`/requests/${req.id}`} className="flex flex-1 items-center gap-3 min-w-0">
        <UserAvatar name={req.requesterName ?? "?"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {req.requesterName ?? "Unknown"}
            </span>
            <Badge variant="outline" className={`shrink-0 text-[10px] border-0 ${STATUS_CONFIG[req.status].className}`}>
              {STATUS_CONFIG[req.status].label}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{req.narration}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold font-tabular text-primary">
          {formatMoney(req.amountCents, req.currencyCode)}
        </span>
      </Link>
      {req.status === "pending" && (
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            disabled={pay.isPending}
            onClick={() => pay.mutate(req.id)}
          >
            {pay.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pay"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            disabled={decline.isPending}
            onClick={() => decline.mutate({ id: req.id })}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}

function SentRequestRow({ req }: { req: PaymentRequest }) {
  const remind = useRemindRequest();
  const cancel = useCancelRequest();

  return (
    <div className="flex items-center gap-3">
      <Link href={`/requests/${req.id}`} className="flex flex-1 items-center gap-3 min-w-0">
        <UserAvatar name={req.payerName ?? "?"} isNeo={false} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {req.payerName ?? "Unknown"}
            </span>
            <Badge variant="outline" className={`shrink-0 text-[10px] border-0 ${STATUS_CONFIG[req.status].className}`}>
              {STATUS_CONFIG[req.status].label}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{req.narration}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold font-tabular">
          {formatMoney(req.amountCents, req.currencyCode)}
        </span>
      </Link>
      {req.status === "pending" && (
        <div className="flex shrink-0 gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs"
            disabled={remind.isPending}
            onClick={() => remind.mutate(req.id)}
          >
            {remind.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs text-destructive hover:text-destructive"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate(req.id)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

function sortPendingFirst(a: PaymentRequest, b: PaymentRequest) {
  if (a.status === "pending" && b.status !== "pending") return -1;
  if (a.status !== "pending" && b.status === "pending") return 1;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export default function RequestsPage() {
  const [tab, setTab] = useState<Tab>("received");
  const received = useReceivedRequests();
  const sent = useSentRequests();
  const pendingCount = usePendingRequestCount();

  const count = pendingCount.data?.count ?? 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Payments Hub</h1>
        </div>
        <Link href="/requests/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setTab("received")}
          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "received"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Received
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`flex flex-1 items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "sent"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Sent
        </button>
      </div>

      {/* Received tab */}
      {tab === "received" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {received.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : received.isError ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <p className="text-sm text-muted-foreground">Could not load requests</p>
              <button onClick={() => received.refetch()} className="text-sm font-medium text-primary">
                Try again
              </button>
            </div>
          ) : received.data && received.data.length > 0 ? (
            <div className="space-y-2">
              {[...received.data].sort(sortPendingFirst).map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
                >
                  <ReceivedRequestRow req={req} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <HandCoins className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No requests received</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Sent tab */}
      {tab === "sent" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {sent.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : sent.isError ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <p className="text-sm text-muted-foreground">Could not load requests</p>
              <button onClick={() => sent.refetch()} className="text-sm font-medium text-primary">
                Try again
              </button>
            </div>
          ) : sent.data && sent.data.length > 0 ? (
            <div className="space-y-2">
              {[...sent.data].sort(sortPendingFirst).map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
                >
                  <SentRequestRow req={req} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <HandCoins className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No requests sent</p>
              <Link href="/requests/new" className="text-sm font-medium text-primary">
                Request money
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
