"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { BusinessTransfer } from "@/lib/business-types";

export function useBusinessTransferDetail(
  bizId: string | null,
  transferId: string | null,
) {
  return useQuery<BusinessTransfer>({
    queryKey: ["business", bizId, "transfers", transferId],
    queryFn: () =>
      api.get<BusinessTransfer>(
        `/v1/business/${bizId}/transfers/${transferId}`,
      ),
    enabled: !!bizId && !!transferId,
  });
}
