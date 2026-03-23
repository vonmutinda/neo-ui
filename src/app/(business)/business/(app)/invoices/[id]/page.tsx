"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import {
  useInvoiceDetail,
  useSendInvoice,
  useCancelInvoice,
  useRecordPayment,
} from "@/hooks/business/use-invoice-detail";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { PageHeader } from "@/components/shared/PageHeader";
import { InvoiceDetailView } from "@/components/business/invoices/InvoiceDetailView";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { activeBusinessId } = useBusinessStore();

  const { data: invoice, isLoading } = useInvoiceDetail(
    activeBusinessId,
    invoiceId,
  );
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const sendMutation = useSendInvoice(activeBusinessId);
  const cancelMutation = useCancelInvoice(activeBusinessId);
  const recordPaymentMutation = useRecordPayment(activeBusinessId);

  const canManage = permissions?.includes("biz:invoices:manage") ?? false;

  function handleSend() {
    sendMutation.mutate(invoiceId, {
      onSuccess: () => toast.success("Invoice sent"),
      onError: () => toast.error("Failed to send invoice"),
    });
  }

  function handleCancel() {
    cancelMutation.mutate(invoiceId, {
      onSuccess: () => toast.success("Invoice cancelled"),
      onError: () => toast.error("Failed to cancel invoice"),
    });
  }

  function handleRecordPayment() {
    if (!invoice) return;

    const remainingCents = invoice.totalCents - invoice.paidCents;
    const remainingFormatted = formatMoney(
      remainingCents,
      invoice.currencyCode,
      undefined,
      0,
    );

    const input = window.prompt(
      `Enter payment amount in ${invoice.currencyCode} (remaining: ${remainingFormatted}):`,
    );

    if (!input) return;

    const parsed = parseFloat(input);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountCents = Math.round(parsed * 100);

    recordPaymentMutation.mutate(
      { invoiceId, body: { amountCents } },
      {
        onSuccess: () => toast.success("Payment recorded"),
        onError: () => toast.error("Failed to record payment"),
      },
    );
  }

  if (isLoading || !invoice) {
    return (
      <div className="space-y-6">
        <PageHeader title="Invoice" backHref="/business/invoices" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Invoice" backHref="/business/invoices" />
      <InvoiceDetailView
        invoice={invoice}
        canManage={canManage}
        onSend={handleSend}
        onRecordPayment={handleRecordPayment}
        onCancel={handleCancel}
        isSending={sendMutation.isPending}
        isCancelling={cancelMutation.isPending}
      />
    </div>
  );
}
