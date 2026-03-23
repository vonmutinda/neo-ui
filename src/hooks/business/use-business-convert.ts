"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface ConvertRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  midRate: number;
  invertedRate: number;
}

interface BusinessConvertRequest {
  amountCents: number;
  fromCurrency: string;
  toCurrency: string;
}

export function useBusinessConvertRate(
  bizId: string | null,
  from?: string,
  to?: string,
  amount?: number,
) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (amount) params.set("amount", String(amount));
  const qs = params.toString();

  return useQuery<ConvertRate>({
    queryKey: ["business", bizId, "convert-rate", from, to, amount],
    queryFn: () =>
      api.get<ConvertRate>(
        `/v1/business/${bizId}/convert/rate${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId && !!from && !!to,
    staleTime: 10_000,
  });
}

export function useBusinessConvert(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, BusinessConvertRequest>({
    mutationFn: (body) => api.post(`/v1/business/${bizId}/convert`, body),
    onSuccess: () => {
      toast.success("Currency conversion completed");
      qc.invalidateQueries({ queryKey: ["business", bizId] });
    },
    onError: (err) =>
      toast.error("Conversion failed", { description: err.message }),
  });
}
