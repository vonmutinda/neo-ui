"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Receipt,
  Building2,
  Calendar,
  Hash,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useBillPayment } from "@/hooks/use-bill-payments";
import { formatMoney } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  success: "bg-success/10 text-success border-success/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  pending: <Clock className="h-5 w-5 text-yellow-600" />,
  failed: <XCircle className="h-5 w-5 text-destructive" />,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BillPaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading } = useBillPayment(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment Details" backHref="/bill-payments" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-muted-foreground">Payment not found</p>
        <Link
          href="/bill-payments"
          className="text-sm font-medium text-primary"
        >
          Back to bill payments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payment Details" backHref="/bill-payments" />

      {/* Amount + Status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/60 bg-card p-6 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          {STATUS_ICONS[payment.status] || (
            <Receipt className="h-5 w-5 text-primary" />
          )}
        </div>
        <p className="mt-4 text-3xl font-bold tabular-nums">
          {formatMoney(payment.amountCents, payment.currency)}
        </p>
        <Badge
          variant="outline"
          className={`mt-2 text-xs capitalize ${STATUS_STYLES[payment.status] ?? ""}`}
        >
          {payment.status}
        </Badge>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-0.5 overflow-hidden rounded-2xl border border-border/60 bg-card"
      >
        <DetailRow
          icon={<Building2 className="h-4 w-4" />}
          label="Biller"
          value={payment.billerName}
        />
        <DetailRow
          icon={<Hash className="h-4 w-4" />}
          label="Account / Reference"
          value={payment.customerReference}
        />
        <DetailRow
          icon={<CreditCard className="h-4 w-4" />}
          label="Currency"
          value={payment.currency}
        />
        <DetailRow
          icon={<Calendar className="h-4 w-4" />}
          label="Date"
          value={formatDate(payment.createdAt)}
        />
        {payment.transactionId && (
          <DetailRow
            icon={<Hash className="h-4 w-4" />}
            label="Transaction Reference"
            value={payment.transactionId}
          />
        )}
      </motion.div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
