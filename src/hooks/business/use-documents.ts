"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessDocument,
  DocumentFilter,
  CreateDocumentRequest,
  ExpiringDocumentsResponse,
  PaginatedResult,
} from "@/lib/business-types";

export function useDocuments(bizId: string | null, filter?: DocumentFilter) {
  const params = new URLSearchParams();
  if (filter?.documentType) params.set("documentType", filter.documentType);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessDocument>>({
    queryKey: ["business", bizId, "documents", qs],
    queryFn: () =>
      api.get<PaginatedResult<BusinessDocument>>(
        `/v1/business/${bizId}/documents${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useDocumentDetail(bizId: string | null, docId: string | null) {
  return useQuery<BusinessDocument>({
    queryKey: ["business", bizId, "documents", docId],
    queryFn: () =>
      api.get<BusinessDocument>(`/v1/business/${bizId}/documents/${docId}`),
    enabled: !!bizId && !!docId,
  });
}

export function useExpiringDocuments(bizId: string | null) {
  return useQuery<ExpiringDocumentsResponse>({
    queryKey: ["business", bizId, "documents", "expiring"],
    queryFn: () =>
      api.get<ExpiringDocumentsResponse>(
        `/v1/business/${bizId}/documents/expiring`,
      ),
    enabled: !!bizId,
    staleTime: 60_000,
  });
}

export function useCreateDocument(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessDocument, Error, CreateDocumentRequest>({
    mutationFn: (body) =>
      api.post<BusinessDocument>(`/v1/business/${bizId}/documents`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "documents"] });
    },
  });
}

export function useDeleteDocument(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) =>
      api.delete(`/v1/business/${bizId}/documents/${docId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "documents"] });
    },
  });
}

export function useGetUploadUrl(bizId: string | null) {
  return useMutation<
    { uploadUrl: string; fileKey: string },
    Error,
    { fileName: string; mimeType: string }
  >({
    mutationFn: (body) =>
      api.post<{ uploadUrl: string; fileKey: string }>(
        `/v1/business/${bizId}/documents/upload-url`,
        body,
      ),
  });
}

export function useUpdateDocument(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessDocument,
    Error,
    {
      docId: string;
      body: { name?: string; description?: string; tags?: string[] };
    }
  >({
    mutationFn: ({ docId, body }) =>
      api.patch<BusinessDocument>(
        `/v1/business/${bizId}/documents/${docId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "documents"] });
    },
  });
}
