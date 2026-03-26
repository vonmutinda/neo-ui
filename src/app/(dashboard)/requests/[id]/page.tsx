"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2, Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserAvatar } from "@/components/shared/UserAvatar";
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
  { icon: typeof Clock; label: string; color: string }
> = {
  pending: { icon: Clock, label: "Pending", color: "text-amber-500" },
  paid: { icon: CheckCircle2, label: "Paid", color: "text-green-500" },
  declined: { icon: XCircle, label: "Declined", color: "text-destructive" },
  cancelled: { icon: Ban, label: "Cancelled", color: "text-muted-foreground" },
  expired: { icon: Clock, label: "Expired", color: "text-muted-foreground" },
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: request, isLoading } = usePaymentRequest(id);
  const userId = useAuthStore((s) => s.userId);
  const payRequest = usePayRequest();
  const declineRequest = useDeclineRequest();
  const cancelRequest = useCancelRequest();
  const remindRequest = useRemindRequest();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center pt-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <p className="text-muted-foreground">Request not found</p>
        <Link
          href="/transactions?filter=requests"
          className="text-sm font-semibold text-primary"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;
  const isPending = request.status === "pending";
  const isRequester = request.requesterId === userId;
  const payerPhoneStr = request.payerPhone
    ? `${request.payerPhone.countryCode}${request.payerPhone.number}`
    : undefined;
  const counterpartyName = isRequester
    ? (request.payerName ?? payerPhoneStr ?? "Someone")
    : (request.requesterName ?? "Someone");
  const createdDate = new Date(request.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <motion.div
      className="flex flex-col gap-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
    >
      <PageHeader title="Request" backHref="/transactions?filter=requests" />

      {/* Amount card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
        <p className="font-tabular text-3xl font-bold text-foreground">
          {formatMoney(request.amountCents, request.currencyCode)}
        </p>

        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusCfg.color}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </div>
      </div>

      {/* Details */}
      <div className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">
            {isRequester ? "Requested from" : "Requested by"}
          </span>
          <div className="flex items-center gap-2">
            <UserAvatar
              name={counterpartyName}
              size="sm"
              className="h-6 w-6 text-[10px]"
            />
            <span className="text-sm font-medium">{counterpartyName}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Currency</span>
          <span className="text-sm font-medium">{request.currencyCode}</span>
        </div>
        {request.narration && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Note</span>
            <span className="max-w-[60%] truncate text-sm">
              {request.narration}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">{createdDate}</span>
        </div>
        {request.paidAt && (
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-muted-foreground">Paid</span>
            <span className="text-sm">
              {new Date(request.paidAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex flex-col gap-3">
          {!isRequester ? (
            <>
              <Button
                size="cta"
                onClick={() =>
                  payRequest.mutate(request.id, {
                    onSuccess: () =>
                      router.push("/transactions?filter=requests"),
                  })
                }
                disabled={payRequest.isPending}
              >
                {payRequest.isPending && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                Pay {formatMoney(request.amountCents, request.currencyCode)}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  declineRequest.mutate(
                    { id: request.id },
                    {
                      onSuccess: () =>
                        router.push("/transactions?filter=requests"),
                    },
                  )
                }
                disabled={declineRequest.isPending}
                className="h-14 rounded-xl text-base text-destructive hover:bg-destructive/5"
              >
                Decline
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => remindRequest.mutate(request.id)}
                disabled={remindRequest.isPending}
                className="h-14 rounded-xl text-base font-semibold"
              >
                Send Reminder
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  cancelRequest.mutate(request.id, {
                    onSuccess: () =>
                      router.push("/transactions?filter=requests"),
                  })
                }
                disabled={cancelRequest.isPending}
                className="h-14 rounded-xl text-base text-destructive hover:bg-destructive/5"
              >
                Cancel Request
              </Button>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
