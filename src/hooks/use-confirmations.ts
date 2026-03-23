"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ConfirmationLetter } from "@/lib/types";

export function useConfirmations() {
  return useQuery<ConfirmationLetter[]>({
    queryKey: ["confirmations"],
    queryFn: () => api.get<ConfirmationLetter[]>("/v1/confirmations"),
  });
}

export function useRequestConfirmation() {
  const qc = useQueryClient();
  return useMutation<ConfirmationLetter, Error, void>({
    mutationFn: () => api.post<ConfirmationLetter>("/v1/confirmations", {}),
    onSuccess: () => {
      toast.success("Confirmation letter requested");
      qc.invalidateQueries({ queryKey: ["confirmations"] });
    },
    onError: (err) => {
      toast.error("Failed to request confirmation", {
        description: err.message,
      });
    },
  });
}

export function useConfirmation(id: string) {
  return useQuery<ConfirmationLetter>({
    queryKey: ["confirmations", id],
    queryFn: () => api.get<ConfirmationLetter>(`/v1/confirmations/${id}`),
    enabled: !!id,
  });
}

export function useRevokeConfirmation() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post<void>(`/v1/confirmations/${id}/revoke`, {}),
    onSuccess: (_, id) => {
      toast.success("Confirmation letter revoked");
      qc.invalidateQueries({ queryKey: ["confirmations"] });
      qc.invalidateQueries({ queryKey: ["confirmations", id] });
    },
    onError: (err) => {
      toast.error("Failed to revoke confirmation", {
        description: err.message,
      });
    },
  });
}
