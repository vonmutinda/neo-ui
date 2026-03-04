"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  OverdraftStatusResponse,
  OverdraftRepayRequest,
} from "@/lib/types";

export function useOverdraft() {
  return useQuery<OverdraftStatusResponse>({
    queryKey: ["overdraft"],
    queryFn: () => api.get<OverdraftStatusResponse>("/v1/overdraft"),
  });
}

export function useOverdraftOptIn() {
  const qc = useQueryClient();
  return useMutation<OverdraftStatusResponse, Error, void>({
    mutationFn: () => api.post<OverdraftStatusResponse>("/v1/overdraft/opt-in", {}),
    onSuccess: () => {
      toast.success("Overdraft enabled", {
        description: "You can use overdraft when your balance is short.",
      });
      qc.invalidateQueries({ queryKey: ["overdraft"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Could not enable overdraft", { description: err.message });
    },
  });
}

export function useOverdraftOptOut() {
  const qc = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => api.post<void>("/v1/overdraft/opt-out", {}),
    onSuccess: () => {
      toast.success("Overdraft turned off");
      qc.invalidateQueries({ queryKey: ["overdraft"] });
    },
    onError: (err) => {
      toast.error("Could not turn off overdraft", { description: err.message });
    },
  });
}

export function useOverdraftRepay() {
  const qc = useQueryClient();
  return useMutation<void, Error, OverdraftRepayRequest>({
    mutationFn: (req) =>
      api.post<void>("/v1/overdraft/repay", req),
    onSuccess: () => {
      toast.success("Overdraft repaid", {
        description: "Your overdraft balance has been updated.",
      });
      qc.invalidateQueries({ queryKey: ["overdraft"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Repayment failed", { description: err.message });
    },
  });
}
