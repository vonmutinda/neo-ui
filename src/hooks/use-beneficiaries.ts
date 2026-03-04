"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Beneficiary, CreateBeneficiaryRequest } from "@/lib/types";

export function useBeneficiaries() {
  return useQuery<Beneficiary[]>({
    queryKey: ["beneficiaries"],
    queryFn: () => api.get<Beneficiary[]>("/v1/beneficiaries"),
  });
}

export function useCreateBeneficiary() {
  const qc = useQueryClient();
  return useMutation<Beneficiary, Error, CreateBeneficiaryRequest>({
    mutationFn: (req) => api.post<Beneficiary>("/v1/beneficiaries", req),
    onSuccess: () => {
      toast.success("Beneficiary added");
      qc.invalidateQueries({ queryKey: ["beneficiaries"] });
    },
    onError: (err) => {
      toast.error("Failed to add beneficiary", { description: err.message });
    },
  });
}

export function useDeleteBeneficiary() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/v1/beneficiaries/${id}`),
    onSuccess: () => {
      toast.success("Beneficiary removed");
      qc.invalidateQueries({ queryKey: ["beneficiaries"] });
    },
    onError: (err) => {
      toast.error("Failed to remove beneficiary", { description: err.message });
    },
  });
}
