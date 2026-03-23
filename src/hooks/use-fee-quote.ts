"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { FeeQuote } from "@/lib/types";

interface FeeQuoteParams {
  amountCents: number;
  currency: string;
  transferType: string;
}

export function useFeeQuote(params: FeeQuoteParams) {
  const { amountCents, currency, transferType } = params;

  return useQuery<FeeQuote>({
    queryKey: ["fee-quote", amountCents, currency, transferType],
    queryFn: () => {
      const qs = new URLSearchParams();
      qs.set("amount", String(amountCents));
      qs.set("currency", currency);
      qs.set("type", transferType);
      return api.get<FeeQuote>(`/v1/fees/quote?${qs.toString()}`);
    },
    enabled: !!amountCents && !!currency && !!transferType,
  });
}
