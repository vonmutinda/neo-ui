import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { AdminFXRate, OverrideFXRateRequest } from "@/lib/admin-types";

export function useAdminFXRates() {
  return useQuery({
    queryKey: ["admin", "fx", "rates"],
    queryFn: () => adminApi.get<AdminFXRate[]>("/fx/rates"),
  });
}

export function useAdminFXRateHistory() {
  return useQuery({
    queryKey: ["admin", "fx", "rates", "history"],
    queryFn: () => adminApi.get<AdminFXRate[]>("/fx/rates/history"),
  });
}

export function useAdminOverrideFXRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: OverrideFXRateRequest) =>
      adminApi.post<AdminFXRate>("/fx/rates", req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fx"] }),
  });
}

export function useAdminRefreshFXRates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.post<void>("/fx/rates/refresh"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fx"] }),
  });
}
