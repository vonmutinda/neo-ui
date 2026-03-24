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
 * Download a statement. The backend returns 302 → presigned S3 URL, so
 * we fetch with redirect:"manual" to extract the Location header, then
 * open the presigned URL in a new tab (no auth needed for presigned).
 */
export function useDownloadStatement(bizId: string | null) {
  return useMutation({
    mutationFn: async (statementId: string) => {
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/v1/business/${bizId}/statements/${statementId}/download`;
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("enviar_access_token")
          : null;

      const res = await fetch(url, {
        redirect: "manual",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const location = res.headers.get("Location");
      if (location && typeof window !== "undefined") {
        window.open(location, "_blank");
      } else {
        throw new Error("Download URL not available");
      }
    },
  });
}
