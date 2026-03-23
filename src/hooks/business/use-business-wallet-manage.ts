"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { SupportedCurrency } from "@/lib/types";

export function useCreateCurrencyBalance(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (currencyCode: SupportedCurrency) =>
      api.post(`/v1/business/${bizId}/wallets/balances`, { currencyCode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "wallets"] });
    },
  });
}

export function useDeleteCurrencyBalance(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (currencyCode: SupportedCurrency) =>
      api.delete(`/v1/business/${bizId}/wallets/balances/${currencyCode}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "wallets"] });
    },
  });
}
