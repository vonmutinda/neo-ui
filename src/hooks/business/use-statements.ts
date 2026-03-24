"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessStatement,
  StatementRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useStatements(bizId: string | null) {
  return useQuery<PaginatedResult<BusinessStatement>>({
    queryKey: ["business", bizId, "statements"],
    queryFn: () =>
      api.get<PaginatedResult<BusinessStatement>>(
        `/v1/business/${bizId}/statements`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useRequestStatement(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessStatement, Error, StatementRequest>({
    mutationFn: (body) =>
      api.post<BusinessStatement>(`/v1/business/${bizId}/statements`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "statements"] });
    },
  });
}

/**
 * Download a statement by opening its presigned downloadUrl in a new tab.
 * The downloadUrl is already on the statement object when status is "ready".
 */
export function useDownloadStatement() {
  return useMutation({
    mutationFn: async (downloadUrl: string) => {
      if (!downloadUrl) throw new Error("Download URL not available");
      if (typeof window !== "undefined") {
        window.open(downloadUrl, "_blank");
      }
    },
  });
}
