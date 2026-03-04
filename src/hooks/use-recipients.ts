"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  Recipient,
  RecipientListResponse,
  RecipientType,
  Bank,
  CreateRecipientRequest,
} from "@/lib/types";

export function useRecipients(params?: {
  q?: string;
  type?: RecipientType;
  favorite?: boolean;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.type) qs.set("type", params.type);
  if (params?.favorite !== undefined) qs.set("favorite", String(params.favorite));
  qs.set("limit", String(params?.limit ?? 20));
  qs.set("offset", String(params?.offset ?? 0));

  return useQuery<RecipientListResponse>({
    queryKey: ["recipients", params],
    queryFn: () =>
      api.get<RecipientListResponse>(`/v1/recipients?${qs.toString()}`),
  });
}

export function useRecipient(id: string) {
  return useQuery<Recipient>({
    queryKey: ["recipients", id],
    queryFn: () => api.get<Recipient>(`/v1/recipients/${id}`),
    enabled: !!id,
  });
}

export function useSearchRecipientsByBank(institution: string, account: string) {
  return useQuery<Recipient[]>({
    queryKey: ["recipients", "search", "bank", institution, account],
    queryFn: () =>
      api.get<Recipient[]>(
        `/v1/recipients/search/bank?institution=${encodeURIComponent(institution)}&account=${encodeURIComponent(account)}`,
      ),
    enabled: institution.length > 0 && account.length >= 4,
  });
}

export function useSearchRecipientsByName(name: string) {
  return useQuery<Recipient[]>({
    queryKey: ["recipients", "search", "name", name],
    queryFn: () =>
      api.get<Recipient[]>(
        `/v1/recipients/search/name?q=${encodeURIComponent(name)}`,
      ),
    enabled: name.length >= 2,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; isFavorite: boolean }>({
    mutationFn: ({ id, isFavorite }) =>
      api.patch<void>(`/v1/recipients/${id}/favorite`, { isFavorite }),
    onSuccess: (_, { isFavorite }) => {
      toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Failed to update favorite", { description: err.message });
    },
  });
}

export function useArchiveRecipient() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/v1/recipients/${id}`),
    onSuccess: () => {
      toast.success("Recipient archived");
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Failed to archive recipient", { description: err.message });
    },
  });
}

export function useBanks() {
  return useQuery<Bank[]>({
    queryKey: ["banks"],
    queryFn: () => api.get<Bank[]>("/v1/banks"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRecipient() {
  const qc = useQueryClient();
  return useMutation<Recipient, Error, CreateRecipientRequest>({
    mutationFn: (req) => api.post<Recipient>("/v1/recipients", req),
    onSuccess: () => {
      toast.success("Recipient added");
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Failed to add recipient", { description: err.message });
    },
  });
}
