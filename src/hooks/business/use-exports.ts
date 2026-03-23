"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create export request");
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
      toast.success("Export request submitted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit export request");
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
      toast.success("Export request cancelled");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel export request");
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
      toast.success("Export request updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update export request");
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
      toast.success("Proceeds recorded");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record proceeds");
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
      toast.success("Surrender recorded");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to record surrender");
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

export function useAttachExportDocument(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    {
      exportId: string;
      body: { documentType: string; fileKey: string; fileName: string };
    }
  >({
    mutationFn: ({ exportId, body }) =>
      api.post(`/v1/business/${bizId}/exports/${exportId}/documents`, body),
    onSuccess: (_, { exportId }) => {
      toast.success("Document attached");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "exports", exportId],
      });
    },
    onError: (err) =>
      toast.error("Failed to attach document", { description: err.message }),
  });
}

export function useRemoveExportDocument(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<void, Error, { exportId: string; docId: string }>({
    mutationFn: ({ exportId, docId }) =>
      api.delete(
        `/v1/business/${bizId}/exports/${exportId}/documents/${docId}`,
      ),
    onSuccess: (_, { exportId }) => {
      toast.success("Document removed");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "exports", exportId],
      });
    },
    onError: (err) =>
      toast.error("Failed to remove document", { description: err.message }),
  });
}
