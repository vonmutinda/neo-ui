"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { SpendWaterfall } from "@/lib/types";

export function useSpendWaterfall() {
  return useQuery<SpendWaterfall>({
    queryKey: ["spend-waterfall"],
    queryFn: () => api.get<SpendWaterfall>("/v1/me/spend-waterfall"),
  });
}

export function useUpdateSpendWaterfall() {
  const qc = useQueryClient();
  return useMutation<SpendWaterfall, Error, SpendWaterfall>({
    mutationFn: (req) => api.put<SpendWaterfall>("/v1/me/spend-waterfall", req),
    onSuccess: () => {
      toast.success("Spend waterfall updated");
      qc.invalidateQueries({ queryKey: ["spend-waterfall"] });
    },
    onError: (err) => {
      toast.error("Failed to update spend waterfall", {
        description: err.message,
      });
    },
  });
}
