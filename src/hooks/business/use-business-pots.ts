"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessPot,
  BusinessPotSummaryItem,
  BusinessPotArchiveResult,
  CreateBusinessPotRequest,
  UpdateBusinessPotRequest,
  BusinessPotTransferRequest,
  PotCategory,
  PaginatedResult,
} from "@/lib/business-types";

// --- Queries ---

interface BusinessPotFilter {
  category?: PotCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

export function useBusinessPots(
  bizId: string | null,
  filter?: BusinessPotFilter,
) {
  const params = new URLSearchParams();
  if (filter?.category) params.set("category", filter.category);
  if (filter?.search) params.set("search", filter.search);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessPot>>({
    queryKey: ["business", bizId, "pots", filter],
    queryFn: () =>
      api.get<PaginatedResult<BusinessPot>>(
        `/v1/business/${bizId}/pots${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useBusinessPot(
  bizId: string | null,
  potId: string | undefined,
) {
  return useQuery<BusinessPot>({
    queryKey: ["business", bizId, "pots", potId],
    queryFn: () => api.get<BusinessPot>(`/v1/business/${bizId}/pots/${potId}`),
    enabled: !!bizId && !!potId,
    staleTime: 15_000,
  });
}

export function useBusinessPotSummary(bizId: string | null) {
  return useQuery<BusinessPotSummaryItem[]>({
    queryKey: ["business", bizId, "pots", "summary"],
    queryFn: () =>
      api.get<BusinessPotSummaryItem[]>(`/v1/business/${bizId}/pots/summary`),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

// Pot transactions from the ledger
export interface PotTransaction {
  id: string;
  type: string;
  amountCents: number;
  currency: string;
  description: string;
  createdAt: string;
}

export function useBusinessPotTransactions(
  bizId: string | null,
  potId: string | undefined,
  limit = 20,
) {
  return useQuery<PotTransaction[]>({
    queryKey: ["business", bizId, "pots", potId, "transactions", limit],
    queryFn: () =>
      api.get<PotTransaction[]>(
        `/v1/business/${bizId}/pots/${potId}/transactions?limit=${limit}`,
      ),
    enabled: !!bizId && !!potId,
    staleTime: 15_000,
  });
}

// --- Mutations ---

export function useCreateBusinessPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessPot, Error, CreateBusinessPotRequest>({
    mutationFn: (body) =>
      api.post<BusinessPot>(`/v1/business/${bizId}/pots`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "pots"] });
    },
  });
}

export function useUpdateBusinessPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessPot,
    Error,
    { potId: string; body: UpdateBusinessPotRequest }
  >({
    mutationFn: ({ potId, body }) =>
      api.patch<BusinessPot>(`/v1/business/${bizId}/pots/${potId}`, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "pots"] });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "pots", vars.potId],
      });
    },
  });
}

export function useArchiveBusinessPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessPotArchiveResult | undefined, Error, string>({
    mutationFn: (potId) =>
      api.delete<BusinessPotArchiveResult | undefined>(
        `/v1/business/${bizId}/pots/${potId}`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "pots"] });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "wallets"],
      });
    },
  });
}

export function useAddToBusinessPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessPot,
    Error,
    { potId: string; body: BusinessPotTransferRequest }
  >({
    mutationFn: ({ potId, body }) =>
      api.post<BusinessPot>(`/v1/business/${bizId}/pots/${potId}/add`, body),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "pots"] });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "pots", vars.potId],
      });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "wallets"],
      });
    },
  });
}

export function useWithdrawFromBusinessPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessPot,
    Error,
    { potId: string; body: BusinessPotTransferRequest }
  >({
    mutationFn: ({ potId, body }) =>
      api.post<BusinessPot>(
        `/v1/business/${bizId}/pots/${potId}/withdraw`,
        body,
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "pots"] });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "pots", vars.potId],
      });
      qc.invalidateQueries({
        queryKey: ["business", bizId, "wallets"],
      });
    },
  });
}
