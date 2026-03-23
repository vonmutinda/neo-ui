"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { TransactionLabel } from "@/lib/types";

export function useAddTransactionLabel() {
  const qc = useQueryClient();
  return useMutation<TransactionLabel, Error, { txId: string; label: string }>({
    mutationFn: ({ txId, label }) =>
      api.post<TransactionLabel>(`/v1/transactions/${txId}/label`, { label }),
    onSuccess: (_, { txId }) => {
      toast.success("Label added");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", txId] });
    },
    onError: (err) => {
      toast.error("Failed to add label", { description: err.message });
    },
  });
}

export function useUpdateTransactionLabel() {
  const qc = useQueryClient();
  return useMutation<TransactionLabel, Error, { txId: string; label: string }>({
    mutationFn: ({ txId, label }) =>
      api.patch<TransactionLabel>(`/v1/transactions/${txId}/label`, { label }),
    onSuccess: (_, { txId }) => {
      toast.success("Label updated");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", txId] });
    },
    onError: (err) => {
      toast.error("Failed to update label", { description: err.message });
    },
  });
}

export function useRemoveTransactionLabel() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (txId) => api.delete<void>(`/v1/transactions/${txId}/label`),
    onSuccess: (_, txId) => {
      toast.success("Label removed");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", txId] });
    },
    onError: (err) => {
      toast.error("Failed to remove label", { description: err.message });
    },
  });
}
