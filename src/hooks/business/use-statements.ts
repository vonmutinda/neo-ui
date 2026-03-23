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

export function useDownloadStatement(bizId: string | null) {
  return useMutation({
    mutationFn: async (statementId: string) => {
      const result = await api.get<{ downloadUrl: string }>(
        `/v1/business/${bizId}/statements/${statementId}/download`,
      );
      if (result.downloadUrl && typeof window !== "undefined") {
        window.open(result.downloadUrl, "_blank");
      }
      return result;
    },
  });
}
