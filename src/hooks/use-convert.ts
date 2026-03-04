"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { ConvertRequest, ConvertResponse, ExchangeRate } from "@/lib/types";

export function useExchangeRate(from: string, to: string) {
  return useQuery<ExchangeRate>({
    queryKey: ["convert", "rate", from, to],
    queryFn: () =>
      api.get<ExchangeRate>(`/v1/convert/rate?from=${from}&to=${to}`),
    enabled: !!from && !!to && from !== to,
    staleTime: 60_000,
  });
}

export function useConvert() {
  const qc = useQueryClient();

  return useMutation<ConvertResponse, Error, ConvertRequest>({
    mutationFn: (req) => api.post<ConvertResponse>("/v1/convert", req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}
