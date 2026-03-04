import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  AdminFeeSchedule,
  AdminRemittanceProvider,
  CreateFeeScheduleRequest,
  UpdateFeeScheduleRequest,
  UpdateProviderRequest,
} from "@/lib/admin-types";

export function useAdminFeeSchedules() {
  return useQuery({
    queryKey: ["admin", "fees"],
    queryFn: () => adminApi.get<AdminFeeSchedule[]>("/fees"),
  });
}

export function useAdminCreateFeeSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateFeeScheduleRequest) =>
      adminApi.post<AdminFeeSchedule>("/fees", req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fees"] }),
  });
}

export function useAdminUpdateFeeSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFeeScheduleRequest & { id: string }) =>
      adminApi.put<AdminFeeSchedule>(`/fees/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fees"] }),
  });
}

export function useAdminDeactivateFeeSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete<void>(`/fees/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fees"] }),
  });
}

export function useAdminProviders() {
  return useQuery({
    queryKey: ["admin", "fees", "providers"],
    queryFn: () => adminApi.get<AdminRemittanceProvider[]>("/fees/providers"),
  });
}

export function useAdminUpdateProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateProviderRequest & { id: string }) =>
      adminApi.put<AdminRemittanceProvider>(`/fees/providers/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "fees"] }),
  });
}
