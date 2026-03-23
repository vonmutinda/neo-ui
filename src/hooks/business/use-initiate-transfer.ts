"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessTransfer,
  InitiateTransferRequest,
} from "@/lib/business-types";

export function useInitiateTransfer(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessTransfer, Error, InitiateTransferRequest>({
    mutationFn: (body) =>
      api.post<BusinessTransfer>(`/v1/business/${bizId}/transfers`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "transfers"] });
      qc.invalidateQueries({ queryKey: ["business", bizId, "wallets"] });
    },
  });
}
