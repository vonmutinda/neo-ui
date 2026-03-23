"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { AdminCurrency } from "@/lib/admin-types";

export function useAdminCurrencies() {
  return useQuery({
    queryKey: ["admin", "currencies"],
    queryFn: () => adminApi.get<AdminCurrency[]>("/currencies"),
  });
}

export function useAdminUpsertCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AdminCurrency) =>
      adminApi.post<AdminCurrency>("/currencies", body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "currencies"] }),
  });
}

export function useAdminToggleCurrencyStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, isActive }: { code: string; isActive: boolean }) =>
      adminApi.patch<void>(`/currencies/${code}/status`, { isActive }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "currencies"] }),
  });
}
