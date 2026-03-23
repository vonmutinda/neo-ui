"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface KYBStatus {
  level: number;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  documents: { type: string; status: string; reviewedAt?: string }[];
}

interface SubmitKYBRequest {
  documents: { type: string; fileKey: string; fileName: string }[];
}

export function useBusinessKYBStatus(bizId: string | null) {
  return useQuery<KYBStatus>({
    queryKey: ["business", bizId, "kyb"],
    queryFn: () => api.get<KYBStatus>(`/v1/business/${bizId}/kyb`),
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
