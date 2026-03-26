"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  ImportRequest,
  ImportFilter,
  CreateImportRequest,
  UploadURLResponse,
  DocumentURLResponse,
  ReviewDocumentRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useImports(bizId: string | null, filter?: ImportFilter) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<ImportRequest>>({
    queryKey: ["business", bizId, "imports", qs],
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
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create import request");
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
      toast.success("Import request submitted");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to submit import request");
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
      toast.success("Import request cancelled");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to cancel import request");
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
      toast.success("Import request updated");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update import request");
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

export function useAttachImportDocument(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    {
      importId: string;
      body: { documentType: string; fileKey: string; fileName: string };
    }
  >({
    mutationFn: ({ importId, body }) =>
      api.post(`/v1/business/${bizId}/imports/${importId}/documents`, body),
    onSuccess: (_, { importId }) => {
      toast.success("Document attached");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "imports", importId],
      });
    },
    onError: (err) =>
      toast.error("Failed to attach document", { description: err.message }),
  });
}

export function useRemoveImportDocument(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<void, Error, { importId: string; docId: string }>({
    mutationFn: ({ importId, docId }) =>
      api.delete(
        `/v1/business/${bizId}/imports/${importId}/documents/${docId}`,
      ),
    onSuccess: (_, { importId }) => {
      toast.success("Document removed");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "imports", importId],
      });
    },
    onError: (err) =>
      toast.error("Failed to remove document", { description: err.message }),
  });
}

export function useImportConversion(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    {
      importId: string;
      body: { amountCents: number; fromCurrency: string; toCurrency: string };
    }
  >({
    mutationFn: ({ importId, body }) =>
      api.post(`/v1/business/${bizId}/imports/${importId}/convert`, body),
    onSuccess: (_, { importId }) => {
      toast.success("FX conversion executed");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "imports", importId],
      });
    },
    onError: (err) =>
      toast.error("Conversion failed", { description: err.message }),
  });
}

export function useDocumentUploadUrl(bizId: string | null) {
  return useMutation<UploadURLResponse, Error, void>({
    mutationFn: () =>
      api.post<UploadURLResponse>(
        `/v1/business/${bizId}/documents/upload-url`,
        {},
      ),
  });
}

export function useImportDocumentUrl(
  bizId: string | null,
  importId: string | null,
  docId: string | null,
) {
  return useQuery<DocumentURLResponse>({
    queryKey: [
      "business",
      bizId,
      "imports",
      importId,
      "documents",
      docId,
      "url",
    ],
    queryFn: () =>
      api.get<DocumentURLResponse>(
        `/v1/business/${bizId}/imports/${importId}/documents/${docId}/url`,
      ),
    enabled: !!bizId && !!importId && !!docId,
  });
}

export function useReviewImportDocument(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<
    { status: string },
    Error,
    { importId: string; docId: string; body: ReviewDocumentRequest }
  >({
    mutationFn: ({ importId, docId, body }) =>
      api.patch<{ status: string }>(
        `/v1/business/${bizId}/imports/${importId}/documents/${docId}/review`,
        body,
      ),
    onSuccess: (_, { importId }) => {
      toast.success("Document reviewed");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "imports", importId],
      });
    },
    onError: (err) =>
      toast.error("Failed to review document", { description: err.message }),
  });
}

export function useUpdateImportStatus(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    Error,
    {
      importId: string;
      body: {
        status: string;
        bankPermitNumber?: string;
        eswReference?: string;
        notes?: string;
      };
    }
  >({
    mutationFn: ({ importId, body }) =>
      api.patch(`/v1/business/${bizId}/imports/${importId}/status`, body),
    onSuccess: (_, { importId }) => {
      toast.success("Import status updated");
      qc.invalidateQueries({
        queryKey: ["business", bizId, "imports", importId],
      });
      qc.invalidateQueries({ queryKey: ["business", bizId, "imports"] });
    },
    onError: (err) =>
      toast.error("Failed to update status", { description: err.message }),
  });
}
