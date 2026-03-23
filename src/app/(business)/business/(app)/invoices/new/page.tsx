"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useBusinessStore } from "@/providers/business-store";
import { useCreateInvoice } from "@/hooks/business/use-create-invoice";
import { useSendInvoice } from "@/hooks/business/use-invoice-detail";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  InvoiceForm,
  type InvoiceFormState,
} from "@/components/business/invoices/InvoiceForm";
import { InvoicePreview } from "@/components/business/invoices/InvoicePreview";
import { InvoicesSkeleton } from "@/components/business/invoices/InvoicesSkeleton";
import { useBusinessPermissionCheck } from "@/hooks/business/use-business-members";
import type { CreateInvoiceRequest } from "@/lib/business-types";

const INITIAL_PREVIEW: InvoiceFormState = {
  customerName: "",
  customerEmail: "",
  currencyCode: "ETB",
  lineItems: [],
  subtotalCents: 0,
  taxCents: 0,
  totalCents: 0,
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function NewInvoicePage() {
  const router = useRouter();
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const { isChecking, allowed: canManageInvoices } = useBusinessPermissionCheck(
    ["biz:invoices:manage"],
  );

  const createMutation = useCreateInvoice(activeBusinessId);
  const sendMutation = useSendInvoice(activeBusinessId);

  const [previewState, setPreviewState] =
    useState<InvoiceFormState>(INITIAL_PREVIEW);

  const handleSaveDraft = useCallback(
    (data: CreateInvoiceRequest) => {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Invoice saved as draft");
          router.push("/business/invoices");
        },
        onError: () => toast.error("Failed to save invoice"),
      });
    },
    [createMutation, router],
  );

  const handleSend = useCallback(
    (data: CreateInvoiceRequest) => {
      createMutation.mutate(data, {
        onSuccess: (invoice) => {
          sendMutation.mutate(invoice.id, {
            onSuccess: () => {
              toast.success("Invoice created and sent");
              router.push("/business/invoices");
            },
            onError: () => {
              toast.success("Invoice created but could not be sent");
              router.push("/business/invoices");
            },
          });
        },
        onError: () => toast.error("Failed to create invoice"),
      });
    },
    [createMutation, sendMutation, router],
  );

  const isSubmitting = createMutation.isPending || sendMutation.isPending;
  const businessName =
    activeBusiness?.tradeName || activeBusiness?.name || "Your Business";

  if (isChecking) {
    return <InvoicesSkeleton />;
  }

  if (!canManageInvoices) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Invoice" backHref="/business/invoices" />
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to create or manage invoices for this
          business.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="New Invoice" backHref="/business/invoices" />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div>
          <InvoiceForm
            onSaveDraft={handleSaveDraft}
            onSend={handleSend}
            isSubmitting={isSubmitting}
            onChange={setPreviewState}
          />
        </div>

        {/* Preview (sticky) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Preview
            </p>
            <InvoicePreview data={previewState} businessName={businessName} />
          </div>
        </div>
      </div>
    </div>
  );
}
