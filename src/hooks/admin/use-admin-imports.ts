"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { ImportRequest } from "@/lib/business-types";
import type { PaginationMeta } from "@/lib/admin-types";

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function useAdminImportList(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "imports", limit, offset],
    queryFn: () =>
      adminApi.get<PaginatedData<ImportRequest>>(
        `/imports?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminImport(id: string) {
  return useQuery({
    queryKey: ["admin", "imports", id],
    queryFn: () => adminApi.get<ImportRequest>(`/imports/${id}`),
    enabled: !!id,
  });
}

export function useAdminImportDocuments(importId: string) {
  return useQuery({
    queryKey: ["admin", "imports", importId, "documents"],
    queryFn: () => adminApi.get<unknown[]>(`/imports/${importId}/documents`),
    enabled: !!importId,
  });
}

export function useAdminReviewImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { status: "approved" | "rejected"; reason?: string };
    }) => adminApi.post<{ status: string }>(`/imports/${id}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "imports"] });
    },
  });
}
