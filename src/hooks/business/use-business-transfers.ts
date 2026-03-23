"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessTransfer,
  BusinessTransferFilter,
  PaginatedResult,
} from "@/lib/business-types";

export function useBusinessTransfers(
  bizId: string | null,
  filter?: BusinessTransferFilter,
) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  if (filter?.search) params.set("search", filter.search);
  if (filter?.currencyCode) params.set("currencyCode", filter.currencyCode);
  if (filter?.transferType) params.set("transferType", filter.transferType);
  if (filter?.initiatedBy) params.set("initiatedBy", filter.initiatedBy);
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessTransfer>>({
    queryKey: ["business", bizId, "transfers", filter],
    queryFn: () =>
      api.get<PaginatedResult<BusinessTransfer>>(
        `/v1/business/${bizId}/transfers${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useApproveTransfer(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (transferId: string) =>
      api.post(`/v1/business/${bizId}/transfers/${transferId}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "transfers"] });
    },
  });
}

export function useRejectTransfer(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      transferId,
      reason,
    }: {
      transferId: string;
      reason: string;
    }) =>
      api.post(`/v1/business/${bizId}/transfers/${transferId}/reject`, {
        reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "transfers"] });
    },
  });
}
