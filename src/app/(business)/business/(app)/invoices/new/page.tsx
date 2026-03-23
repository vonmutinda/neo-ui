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
