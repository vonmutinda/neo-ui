"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  Card,
  CardStatusUpdate,
  CardLimitsUpdate,
  CardTogglesUpdate,
  CreateCardRequest,
} from "@/lib/types";

export function useCards() {
  return useQuery<Card[]>({
    queryKey: ["cards"],
    queryFn: () => api.get<Card[]>("/v1/cards"),
  });
}

export function useCard(id: string) {
  return useQuery<Card>({
    queryKey: ["cards", id],
    queryFn: () => api.get<Card>(`/v1/cards/${id}`),
    enabled: !!id,
  });
}

export function useUpdateCardStatus(id: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, CardStatusUpdate>({
    mutationFn: (req) => api.patch<void>(`/v1/cards/${id}/status`, req),
    onSuccess: (_, vars) => {
      const action = vars.status === "frozen" ? "frozen" : "activated";
      toast.success(`Card ${action}`);
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err) => {
      toast.error("Failed to update card", { description: err.message });
    },
  });
}

export function useUpdateCardLimits(id: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, CardLimitsUpdate>({
    mutationFn: (req) => api.patch<void>(`/v1/cards/${id}/limits`, req),
    onSuccess: () => {
      toast.success("Spending limits updated");
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err) => {
      toast.error("Failed to update limits", { description: err.message });
    },
  });
}

export function useUpdateCardToggles(id: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, CardTogglesUpdate>({
    mutationFn: (req) => api.patch<void>(`/v1/cards/${id}/toggles`, req),
    onSuccess: () => {
      toast.success("Payment channels updated");
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err) => {
      toast.error("Failed to update toggles", { description: err.message });
    },
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation<Card, Error, CreateCardRequest>({
    mutationFn: (req) => api.post<Card>("/v1/cards", req),
    onSuccess: (card) => {
      toast.success(`${card.type.charAt(0).toUpperCase() + card.type.slice(1)} card created`);
      qc.invalidateQueries({ queryKey: ["cards"] });
    },
    onError: (err) => {
      toast.error("Failed to create card", { description: err.message });
    },
  });
}
