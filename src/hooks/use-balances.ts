"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/providers/auth-store";
import type { CurrencyBalanceDetail, CreateBalanceRequest } from "@/lib/types";

export function useBalances() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<CurrencyBalanceDetail[]>({
    queryKey: ["balances"],
    queryFn: () => api.get<CurrencyBalanceDetail[]>("/v1/balances"),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useCreateBalance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (req: CreateBalanceRequest) =>
      api.post<CurrencyBalanceDetail>("/v1/balances", req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["wallets", "summary"] });
    },
  });
}

export function useDeleteBalance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (currencyCode: string) =>
      api.delete(`/v1/balances/${currencyCode}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["wallets", "summary"] });
    },
  });
}
