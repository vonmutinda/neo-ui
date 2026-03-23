"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Challenge } from "@/lib/types";

export function useChallenges() {
  return useQuery<Challenge[]>({
    queryKey: ["challenges"],
    queryFn: () => api.get<Challenge[]>("/v1/challenges"),
  });
}

export function useChallenge(id: string) {
  return useQuery<Challenge>({
    queryKey: ["challenges", id],
    queryFn: () => api.get<Challenge>(`/v1/challenges/${id}`),
    enabled: !!id,
  });
}

export function useApproveChallenge() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post<void>(`/v1/challenges/${id}/approve`, {}),
    onSuccess: (_, id) => {
      toast.success("Challenge approved");
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["challenges", id] });
    },
    onError: (err) => {
      toast.error("Failed to approve challenge", {
        description: err.message,
      });
    },
  });
}

export function useDenyChallenge() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.post<void>(`/v1/challenges/${id}/deny`, {}),
    onSuccess: (_, id) => {
      toast.success("Challenge denied");
      qc.invalidateQueries({ queryKey: ["challenges"] });
      qc.invalidateQueries({ queryKey: ["challenges", id] });
    },
    onError: (err) => {
      toast.error("Failed to deny challenge", { description: err.message });
    },
  });
}
