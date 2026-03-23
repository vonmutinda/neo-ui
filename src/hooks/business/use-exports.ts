"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  ExportRequest,
  ExportFilter,
  CreateExportRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useExports(bizId: string | null, filter?: ExportFilter) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<ExportRequest>>({
    queryKey: ["business", bizId, "exports", filter],
    queryFn: () =>
      api.get<PaginatedResult<ExportRequest>>(
        `/v1/business/${bizId}/exports${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useExportDetail(bizId: string | null, exportId: string | null) {
  return useQuery<ExportRequest>({
    queryKey: ["business", bizId, "exports", exportId],
    queryFn: () =>
      api.get<ExportRequest>(`/v1/business/${bizId}/exports/${exportId}`),
    enabled: !!bizId && !!exportId,
  });
}

export function useCreateExport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<ExportRequest, Error, CreateExportRequest>({
    mutationFn: (body) =>
      api.post<ExportRequest>(`/v1/business/${bizId}/exports`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useSubmitExport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (exportId: string) =>
      api.post(`/v1/business/${bizId}/exports/${exportId}/submit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useCancelExport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (exportId: string) =>
      api.post(`/v1/business/${bizId}/exports/${exportId}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useUpdateExport(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    ExportRequest,
    Error,
    { exportId: string; body: Partial<CreateExportRequest> }
  >({
    mutationFn: ({ exportId, body }) =>
      api.patch<ExportRequest>(
        `/v1/business/${bizId}/exports/${exportId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useRecordProceeds(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    {
      exportId: string;
      body: { proceedsAmountCents: number; repatriationDate: string };
    }
  >({
    mutationFn: ({ exportId, body }) =>
      api.post(`/v1/business/${bizId}/exports/${exportId}/proceeds`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useRecordSurrender(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    {
      exportId: string;
      body: { surrenderedAmountCents: number; retainedAmountCents: number };
    }
  >({
    mutationFn: ({ exportId, body }) =>
      api.post(`/v1/business/${bizId}/exports/${exportId}/surrender`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "exports"] });
    },
  });
}

export function useExportChecklist(bizId: string | null) {
  return useQuery<{ documents: { type: string; required: boolean }[] }>({
    queryKey: ["business", bizId, "exports", "checklist"],
    queryFn: () => api.get(`/v1/business/${bizId}/exports/checklist-template`),
    enabled: !!bizId,
    staleTime: 300_000,
  });
}
