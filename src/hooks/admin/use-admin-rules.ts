"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  AdminRegulatoryRule,
  AdminComplianceReport,
  CreateRuleRequest,
  UpdateRuleRequest,
} from "@/lib/admin-types";

export function useAdminRules() {
  return useQuery({
    queryKey: ["admin", "rules"],
    queryFn: () => adminApi.get<AdminRegulatoryRule[]>("/rules"),
  });
}

export function useAdminRule(id: string) {
  return useQuery({
    queryKey: ["admin", "rules", id],
    queryFn: () => adminApi.get<AdminRegulatoryRule>(`/rules/${id}`),
    enabled: !!id,
  });
}

export function useAdminCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRuleRequest) =>
      adminApi.post<AdminRegulatoryRule>("/rules", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "rules"] }),
  });
}

export function useAdminUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateRuleRequest & { id: string }) =>
      adminApi.patch<AdminRegulatoryRule>(`/rules/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "rules"] }),
  });
}

export function useAdminComplianceReport() {
  return useQuery({
    queryKey: ["admin", "compliance", "report"],
    queryFn: () => adminApi.get<AdminComplianceReport>("/compliance/report"),
  });
}
