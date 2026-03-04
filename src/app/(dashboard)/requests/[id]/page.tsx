"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Bell,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  usePaymentRequest,
  usePayRequest,
  useDeclineRequest,
  useCancelRequest,
  useRemindRequest,
} from "@/hooks/use-payment-requests";
import { useAuthStore } from "@/providers/auth-store";
import { formatMoney } from "@/lib/format";
import type { PaymentRequestStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  PaymentRequestStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "bg-warning/10 text-warning border-warning/20",
    icon: <Clock className="h-4 w-4" />,
  },
  paid: {
    label: "Paid",
    className: "bg-success/10 text-success border-success/20",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  declined: {
    label: "Declined",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: <XCircle className="h-4 w-4" />,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-muted",
    icon: <Ban className="h-4 w-4" />,
  },
  expired: {
    label: "Expired",
    className: "bg-muted text-muted-foreground border-muted",
    icon: <Clock className="h-4 w-4" />,
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = useAuthStore((s) => s.userId);
  const { data: req, isLoading, isError } = usePaymentRequest(id);
  const pay = usePayRequest();
  const decline = useDeclineRequest();
  const cancel = useCancelRequest();
  const remind = useRemindRequest();
  const [showDecline, setShowDecline] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/requests"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Request Detail</h1>
        </div>
        <div className="flex flex-col items-center gap-2 py-20">
          <p className="text-muted-foreground">Could not load request</p>
          <Link href="/requests" className="text-sm font-medium text-primary">
            Back to Payments Hub
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[req.status];
  const isReceiver = req.payerId === userId;
  const isSender = req.requesterId === userId;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/requests"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">Request Detail</h1>
      </div>

      {/* Status card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border bg-card"
      >
        <div className="flex flex-col items-center gap-4 p-6">
          <Badge variant="outline" className={`gap-1 ${status.className}`}>
            {status.icon}
            {status.label}
          </Badge>

          <p className="text-3xl font-bold font-tabular">
            {formatMoney(req.amountCents, req.currencyCode)}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {req.requesterName ?? "Unknown"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">
              {req.payerName ?? "Unknown"}
            </span>
          </div>

          {req.narration && (
            <p className="text-center text-sm text-muted-foreground">
              &ldquo;{req.narration}&rdquo;
            </p>
          )}
        </div>

        {/* Timestamps */}
        <div className="space-y-0 border-t">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <span className="text-xs text-muted-foreground">Created</span>
            <span className="text-xs font-medium">{formatDate(req.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between border-b px-6 py-3">
            <span className="text-xs text-muted-foreground">Expires</span>
            <span className="text-xs font-medium">{formatDate(req.expiresAt)}</span>
          </div>
          {req.paidAt && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Paid</span>
              <span className="text-xs font-medium text-success">{formatDate(req.paidAt)}</span>
            </div>
          )}
          {req.declinedAt && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Declined</span>
              <span className="text-xs font-medium text-destructive">{formatDate(req.declinedAt)}</span>
            </div>
          )}
          {req.declineReason && (
            <div className="flex items-center justify-between px-6 py-3">
              <span className="text-xs text-muted-foreground">Reason</span>
              <span className="text-xs font-medium">{req.declineReason}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Paid: link to transaction */}
      {req.status === "paid" && req.transactionId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/transactions">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full gap-2 text-base font-semibold"
            >
              <CheckCircle2 className="h-5 w-5 text-success" />
              View Transaction
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Actions */}
      {req.status === "pending" && isReceiver && (
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Button
              size="lg"
              className="h-14 w-full gap-2 text-base font-semibold"
              disabled={pay.isPending}
              onClick={() => pay.mutate(req.id)}
            >
              {pay.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pay"}
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full gap-2 text-base font-semibold"
              onClick={() => setShowDecline(true)}
            >
              Decline
            </Button>
          </motion.div>
        </div>
      )}

      {req.status === "pending" && isSender && (
        <div className="space-y-3">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full gap-2 text-base font-semibold"
              disabled={remind.isPending}
              onClick={() => remind.mutate(req.id)}
            >
              {remind.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <Bell className="h-5 w-5" />
                  Send Reminder
                </>
              )}
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full gap-2 text-base font-semibold text-destructive hover:text-destructive"
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(req.id)}
            >
              {cancel.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Cancel Request"}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Decline sheet */}
      {showDecline && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowDecline(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Decline Request</h3>
                <button
                  onClick={() => setShowDecline(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                    Reason (optional)
                  </label>
                  <Input
                    placeholder="Why are you declining?"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="h-14 text-base"
                    autoFocus
                  />
                </div>
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-14 w-full text-base font-semibold"
                  disabled={decline.isPending}
                  onClick={() => {
                    decline.mutate({
                      id: req.id,
                      body: declineReason.trim() ? { reason: declineReason.trim() } : undefined,
                    });
                    setShowDecline(false);
                  }}
                >
                  {decline.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Decline"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
