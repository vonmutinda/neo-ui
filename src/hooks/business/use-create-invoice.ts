"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from "@/lib/business-types";

export function useCreateInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<Invoice, Error, CreateInvoiceRequest>({
    mutationFn: (body) =>
      api.post<Invoice>(`/v1/business/${bizId}/invoices`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "invoices"] });
    },
  });
}

export function useUpdateInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    Invoice,
    Error,
    { invoiceId: string; body: UpdateInvoiceRequest }
  >({
    mutationFn: ({ invoiceId, body }) =>
      api.patch<Invoice>(`/v1/business/${bizId}/invoices/${invoiceId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "invoices"] });
    },
  });
}
