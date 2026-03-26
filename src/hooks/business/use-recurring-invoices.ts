"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  RecurringInvoice,
  RecurringInvoiceFilter,
  CreateRecurringInvoiceRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useRecurringInvoices(
  bizId: string | null,
  filter?: RecurringInvoiceFilter,
) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<RecurringInvoice>>({
    queryKey: ["business", bizId, "recurring-invoices", qs],
    queryFn: () =>
      api.get<PaginatedResult<RecurringInvoice>>(
        `/v1/business/${bizId}/recurring-invoices${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useRecurringInvoiceDetail(
  bizId: string | null,
  recurringId: string | null,
) {
  return useQuery<RecurringInvoice>({
    queryKey: ["business", bizId, "recurring-invoices", recurringId],
    queryFn: () =>
      api.get<RecurringInvoice>(
        `/v1/business/${bizId}/recurring-invoices/${recurringId}`,
      ),
    enabled: !!bizId && !!recurringId,
  });
}

export function useCreateRecurringInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<RecurringInvoice, Error, CreateRecurringInvoiceRequest>({
    mutationFn: (body) =>
      api.post<RecurringInvoice>(
        `/v1/business/${bizId}/recurring-invoices`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "recurring-invoices"],
      });
      toast.success("Recurring invoice created");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create recurring invoice");
    },
  });
}

export function useUpdateRecurringInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    RecurringInvoice,
    Error,
    {
      recurringId: string;
      body: Partial<CreateRecurringInvoiceRequest>;
    }
  >({
    mutationFn: ({ recurringId, body }) =>
      api.patch<RecurringInvoice>(
        `/v1/business/${bizId}/recurring-invoices/${recurringId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "recurring-invoices"],
      });
      toast.success("Recurring invoice updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update recurring invoice");
    },
  });
}

export function usePauseRecurringInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) =>
      api.post(
        `/v1/business/${bizId}/recurring-invoices/${recurringId}/pause`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "recurring-invoices"],
      });
      toast.success("Recurring invoice paused");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to pause recurring invoice");
    },
  });
}

export function useResumeRecurringInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) =>
      api.post(
        `/v1/business/${bizId}/recurring-invoices/${recurringId}/resume`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "recurring-invoices"],
      });
      toast.success("Recurring invoice resumed");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resume recurring invoice");
    },
  });
}

export function useCancelRecurringInvoice(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (recurringId: string) =>
      api.post(
        `/v1/business/${bizId}/recurring-invoices/${recurringId}/cancel`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "recurring-invoices"],
      });
      toast.success("Recurring invoice cancelled");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel recurring invoice");
    },
  });
}
