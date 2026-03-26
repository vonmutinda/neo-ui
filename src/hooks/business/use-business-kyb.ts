"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { KYBSubmission, KYBDocumentType } from "@/lib/business-types";

interface SubmitKYBRequest {
  documents: { type: KYBDocumentType; fileKey: string; fileName: string }[];
}

export function useBusinessKYBStatus(bizId: string | null) {
  return useQuery<KYBSubmission>({
    queryKey: ["business", bizId, "kyb"],
    queryFn: () => api.get<KYBSubmission>(`/v1/business/${bizId}/kyb`),
    enabled: !!bizId,
  });
}

export function useSubmitKYB(bizId: string | null) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, SubmitKYBRequest>({
    mutationFn: (body) => api.post(`/v1/business/${bizId}/kyb`, body),
    onSuccess: () => {
      toast.success("KYB submission sent for review");
      qc.invalidateQueries({ queryKey: ["business", bizId, "kyb"] });
    },
    onError: (err) =>
      toast.error("KYB submission failed", { description: err.message }),
  });
}
