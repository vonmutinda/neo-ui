"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessTransaction,
  BusinessTransactionFilter,
  PaginatedResult,
} from "@/lib/business-types";

export function useBusinessTransactions(
  bizId: string | null,
  filter?: BusinessTransactionFilter,
) {
  const params = new URLSearchParams();
  if (filter?.currency) params.set("currency", filter.currency);
  if (filter?.direction) params.set("direction", filter.direction);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessTransaction>>({
    queryKey: ["business", bizId, "wallets", "transactions", qs],
    queryFn: () =>
      api.get<PaginatedResult<BusinessTransaction>>(
        `/v1/business/${bizId}/wallets/transactions${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useBusinessTransaction(
  bizId: string | null,
  txId: string | null,
) {
  return useQuery<BusinessTransaction>({
    queryKey: ["business", bizId, "wallets", "transactions", txId],
    queryFn: () =>
      api.get<BusinessTransaction>(
        `/v1/business/${bizId}/wallets/transactions/${txId}`,
      ),
    enabled: !!bizId && !!txId,
  });
}
