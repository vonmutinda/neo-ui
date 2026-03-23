"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Invoice, RecordPaymentRequest } from "@/lib/business-types";

export function useInvoiceDetail(
  bizId: string | null,
  invoiceId: string | null,
) {
  return useQuery<Invoice>({
    queryKey: ["business", bizId, "invoices", invoiceId],
    queryFn: () =>
      api.get<Invoice>(`/v1/business/${bizId}/invoices/${invoiceId}`),
    enabled: !!bizId && !!invoiceId,
  });
}

export function useSendInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) =>
      api.post(`/v1/business/${bizId}/invoices/${invoiceId}/send`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "invoices"] });
    },
  });
}

export function useCancelInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) =>
      api.post(`/v1/business/${bizId}/invoices/${invoiceId}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "invoices"] });
    },
  });
}

export function useRecordPayment(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { invoiceId: string; body: RecordPaymentRequest }
  >({
    mutationFn: ({ invoiceId, body }) =>
      api.post(
        `/v1/business/${bizId}/invoices/${invoiceId}/record-payment`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "invoices"] });
    },
  });
}
