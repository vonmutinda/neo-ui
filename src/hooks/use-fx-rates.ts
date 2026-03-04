"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface FXRate {
  from: string;
  to: string;
  mid: number;
  bid: number;
  ask: number;
  spread: number;
  source: string;
  updatedAt: string;
}

interface FXRatesResponse {
  rates: FXRate[] | null;
  currencies: { code: string; name: string; symbol: string; flag: string }[];
}

export function useFXRates() {
  return useQuery<FXRate[]>({
    queryKey: ["fx", "rates"],
    queryFn: async () => {
      const res = await api.get<FXRatesResponse>("/v1/fx/rates");
      return res.rates ?? [];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
