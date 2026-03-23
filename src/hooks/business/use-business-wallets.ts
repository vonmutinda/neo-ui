"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessWalletSummary,
  BusinessCurrencyBalance,
} from "@/lib/business-types";

export function useBusinessWalletSummary(bizId: string | null) {
  return useQuery<BusinessWalletSummary>({
    queryKey: ["business", bizId, "wallets", "summary"],
    queryFn: () =>
      api.get<BusinessWalletSummary>(`/v1/business/${bizId}/wallets/summary`),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useBusinessBalances(bizId: string | null) {
  return useQuery<BusinessCurrencyBalance[]>({
    queryKey: ["business", bizId, "wallets", "balance"],
    queryFn: () =>
      api.get<BusinessCurrencyBalance[]>(
        `/v1/business/${bizId}/wallets/balance`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}
