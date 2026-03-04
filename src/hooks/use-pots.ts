"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/providers/auth-store";
import type {
  Pot,
  CreatePotRequest,
  UpdatePotRequest,
  PotTransferRequest,
  ArchivePotResponse,
} from "@/lib/types";

export function usePots() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Pot[]>({
    queryKey: ["pots"],
    queryFn: () => api.get<Pot[]>("/v1/pots"),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function usePot(id: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Pot>({
    queryKey: ["pots", id],
    queryFn: () => api.get<Pot>(`/v1/pots/${id}`),
    enabled: isAuthenticated && !!id,
    staleTime: 15_000,
  });
}

export function useCreatePot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (req: CreatePotRequest) =>
      api.post<Pot>("/v1/pots", req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pots"] });
    },
  });
}

export function useUpdatePot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...req }: UpdatePotRequest & { id: string }) =>
      api.patch<Pot>(`/v1/pots/${id}`, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pots"] });
    },
  });
}

export function useArchivePot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.delete<ArchivePotResponse | undefined>(`/v1/pots/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pots"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useAddToPot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...req }: PotTransferRequest & { id: string }) =>
      api.post<Pot>(`/v1/pots/${id}/add`, req),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pots"] });
      qc.invalidateQueries({ queryKey: ["pots", vars.id] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}

export function useWithdrawFromPot() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...req }: PotTransferRequest & { id: string }) =>
      api.post<Pot>(`/v1/pots/${id}/withdraw`, req),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pots"] });
      qc.invalidateQueries({ queryKey: ["pots", vars.id] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
  });
}
