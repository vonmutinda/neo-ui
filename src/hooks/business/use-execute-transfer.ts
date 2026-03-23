"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useExecuteTransfer(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (transferId: string) =>
      api.post(`/v1/business/${bizId}/transfers/${transferId}/execute`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "transfers"] });
      qc.invalidateQueries({ queryKey: ["business", bizId, "wallets"] });
    },
  });
}
