"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BatchPayment,
  BatchPaymentFilter,
  CreateBatchPaymentRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useBatchPayments(
  bizId: string | null,
  filter?: BatchPaymentFilter,
) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BatchPayment>>({
    queryKey: ["business", bizId, "batch-payments", filter],
    queryFn: () =>
      api.get<PaginatedResult<BatchPayment>>(
        `/v1/business/${bizId}/batch-payments${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useBatchPaymentDetail(
  bizId: string | null,
  batchId: string | null,
) {
  return useQuery<BatchPayment>({
    queryKey: ["business", bizId, "batch-payments", batchId],
    queryFn: () =>
      api.get<BatchPayment>(`/v1/business/${bizId}/batch-payments/${batchId}`),
    enabled: !!bizId && !!batchId,
  });
}

export function useCreateBatchPayment(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BatchPayment, Error, CreateBatchPaymentRequest>({
    mutationFn: (body) =>
      api.post<BatchPayment>(`/v1/business/${bizId}/batch-payments`, body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "batch-payments"],
      });
    },
  });
}

export function useApproveBatchPayment(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) =>
      api.post(`/v1/business/${bizId}/batch-payments/${batchId}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "batch-payments"],
      });
    },
  });
}

export function useProcessBatchPayment(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) =>
      api.post(`/v1/business/${bizId}/batch-payments/${batchId}/process`, {}),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["business", bizId, "batch-payments"],
      });
    },
  });
}
