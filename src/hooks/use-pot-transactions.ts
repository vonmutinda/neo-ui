"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/providers/auth-store";
import type { Transaction } from "@/lib/types";

export function usePotTransactions(potId: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery<Transaction[]>({
    queryKey: ["pots", potId, "transactions"],
    queryFn: () => api.get<Transaction[]>(`/v1/pots/${potId}/transactions`),
    enabled: isAuthenticated && !!potId,
    staleTime: 15_000,
  });
}
