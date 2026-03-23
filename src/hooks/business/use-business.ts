"use client";

import { useQuery } from "@tanstack/react-query";
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
