"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { ExportRequest } from "@/lib/business-types";
import type { PaginationMeta } from "@/lib/admin-types";

interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function useAdminExportList(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "exports", limit, offset],
    queryFn: () =>
      adminApi.get<PaginatedData<ExportRequest>>(
        `/exports?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminExport(id: string) {
  return useQuery({
    queryKey: ["admin", "exports", id],
    queryFn: () => adminApi.get<ExportRequest>(`/exports/${id}`),
    enabled: !!id,
  });
}

export function useAdminExportDocuments(exportId: string) {
  return useQuery({
    queryKey: ["admin", "exports", exportId, "documents"],
    queryFn: () => adminApi.get<unknown[]>(`/exports/${exportId}/documents`),
    enabled: !!exportId,
  });
}

export function useAdminReviewExport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: { status: "approved" | "rejected"; reason?: string };
    }) => adminApi.post<{ status: string }>(`/exports/${id}/review`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "exports"] });
    },
  });
}
