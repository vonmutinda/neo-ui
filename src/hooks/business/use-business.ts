"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/providers/auth-store";
import type { Business } from "@/lib/business-types";

export function useMyBusinesses() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Business[]>({
    queryKey: ["business", "mine"],
    queryFn: () => api.get<Business[]>("/v1/business/mine"),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useBusiness(id: string | null) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Business>({
    queryKey: ["business", id],
    queryFn: () => api.get<Business>(`/v1/business/${id}`),
    enabled: isAuthenticated && !!id,
    staleTime: 60_000,
  });
}

export function useUpdateDualAuthThreshold(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    { status: string },
    Error,
    { dualAuthThresholdCents: number | null }
  >({
    mutationFn: (body) =>
      api.put<{ status: string }>(
        `/v1/business/${bizId}/settings/dual-auth`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId] });
    },
  });
}
