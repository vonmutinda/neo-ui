"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { AdminKYBSubmission, KYBReviewRequest } from "@/lib/admin-types";

export function useAdminKYBSubmissions() {
  return useQuery({
    queryKey: ["admin", "kyb", "submissions"],
    queryFn: () => adminApi.get<AdminKYBSubmission[]>("/kyb/submissions"),
  });
}

export function useAdminKYBSubmission(id: string) {
  return useQuery({
    queryKey: ["admin", "kyb", "submissions", id],
    queryFn: () => adminApi.get<AdminKYBSubmission>(`/kyb/submissions/${id}`),
    enabled: !!id,
  });
}

export function useAdminReviewKYBSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: KYBReviewRequest & { id: string }) =>
      adminApi.post<void>(`/kyb/submissions/${id}/review`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "kyb"] }),
  });
}

export function useAdminReviewKYBDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNotes,
    }: {
      id: string;
      status: string;
      reviewNotes: string;
    }) =>
      adminApi.post<void>(`/kyb/documents/${id}/review`, {
        status,
        reviewNotes,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "kyb"] }),
  });
}
