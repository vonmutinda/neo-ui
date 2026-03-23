"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessRole,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/lib/business-types";

export function useBusinessRoles(bizId: string | null) {
  return useQuery<BusinessRole[]>({
    queryKey: ["business", bizId, "roles"],
    queryFn: () => api.get<BusinessRole[]>(`/v1/business/${bizId}/roles`),
    enabled: !!bizId,
    staleTime: 60_000,
  });
}

export function useCreateRole(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessRole, Error, CreateRoleRequest>({
    mutationFn: (body) =>
      api.post<BusinessRole>(`/v1/business/${bizId}/roles`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "roles"] });
    },
  });
}

export function useUpdateRole(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessRole,
    Error,
    { roleId: string; body: UpdateRoleRequest }
  >({
    mutationFn: ({ roleId, body }) =>
      api.patch<BusinessRole>(`/v1/business/${bizId}/roles/${roleId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "roles"] });
    },
  });
}

export function useDeleteRole(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) =>
      api.delete(`/v1/business/${bizId}/roles/${roleId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "roles"] });
    },
  });
}
