"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Business, UpdateBusinessRequest } from "@/lib/business-types";

export function useUpdateBusiness(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<Business, Error, UpdateBusinessRequest>({
    mutationFn: (body) => api.patch<Business>(`/v1/business/${bizId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId] });
      qc.invalidateQueries({ queryKey: ["business", "mine"] });
    },
  });
}
