"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  ImportRequest,
  ImportFilter,
  CreateImportRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useImports(bizId: string | null, filter?: ImportFilter) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<ImportRequest>>({
    queryKey: ["business", bizId, "imports", filter],
    queryFn: () =>
      api.get<PaginatedResult<ImportRequest>>(
        `/v1/business/${bizId}/imports${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useImportDetail(bizId: string | null, importId: string | null) {
  return useQuery<ImportRequest>({
    queryKey: ["business", bizId, "imports", importId],
    queryFn: () =>
      api.get<ImportRequest>(`/v1/business/${bizId}/imports/${importId}`),
    enabled: !!bizId && !!importId,
  });
}

export function useCreateImport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<ImportRequest, Error, CreateImportRequest>({
    mutationFn: (body) =>
      api.post<ImportRequest>(`/v1/business/${bizId}/imports`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "imports"] });
    },
  });
}

export function useSubmitImport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) =>
      api.post(`/v1/business/${bizId}/imports/${importId}/submit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "imports"] });
    },
  });
}

export function useCancelImport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (importId: string) =>
      api.post(`/v1/business/${bizId}/imports/${importId}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "imports"] });
    },
  });
}

export function useUpdateImport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    ImportRequest,
    Error,
    { importId: string; body: Partial<CreateImportRequest> }
  >({
    mutationFn: ({ importId, body }) =>
      api.patch<ImportRequest>(
        `/v1/business/${bizId}/imports/${importId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "imports"] });
    },
  });
}

export function useImportChecklist(bizId: string | null) {
  return useQuery<{ documents: { type: string; required: boolean }[] }>({
    queryKey: ["business", bizId, "imports", "checklist"],
    queryFn: () => api.get(`/v1/business/${bizId}/imports/checklist-template`),
    enabled: !!bizId,
    staleTime: 300_000,
  });
}
