"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  AdminBusiness,
  BusinessFilter,
  PaginatedResponse,
  UpdateBusinessStatusRequest,
  AssignRMRequest,
  RelationshipManager,
} from "@/lib/admin-types";

function buildQuery(filter: BusinessFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.status) params.set("status", filter.status);
  if (filter.kybLevel !== undefined)
    params.set("kyb_level", String(filter.kybLevel));
  if (filter.isFrozen !== undefined)
    params.set("is_frozen", String(filter.isFrozen));
  if (filter.market) params.set("market", filter.market);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminBusinesses(filter: BusinessFilter = {}) {
  return useQuery({
    queryKey: ["admin", "businesses", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminBusiness>>(
        `/businesses${buildQuery(filter)}`,
      ),
  });
}

export function useAdminBusiness(id: string) {
  return useQuery({
    queryKey: ["admin", "businesses", id],
    queryFn: () => adminApi.get<AdminBusiness>(`/businesses/${id}`),
    enabled: !!id,
  });
}

export function useAdminFreezeBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.post<void>(`/businesses/${id}/freeze`, { reason }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useAdminUnfreezeBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApi.post<void>(`/businesses/${id}/unfreeze`, {}),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useAdminUpdateBusinessStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: UpdateBusinessStatusRequest & { id: string }) =>
      adminApi.patch<void>(`/businesses/${id}/status`, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useAdminUpdateBusinessKYBLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, kybLevel }: { id: string; kybLevel: number }) =>
      adminApi.patch<void>(`/businesses/${id}/kyb-level`, { kybLevel }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useAdminAddBusinessNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      adminApi.post<void>(`/businesses/${id}/note`, { content }),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses", vars.id] }),
  });
}

export function useAdminAssignRM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: AssignRMRequest & { id: string }) =>
      adminApi.patch<void>(`/businesses/${id}/relationship-manager`, body),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses"] }),
  });
}

export function useAdminRelationshipManagers() {
  return useQuery({
    queryKey: ["admin", "relationship-managers"],
    queryFn: () =>
      adminApi.get<RelationshipManager[]>("/relationship-managers"),
  });
}

interface BusinessDepositRequest {
  id: string;
  amountCents: number;
  asset?: string;
  narration?: string;
}

export function useAdminBusinessDeposit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: BusinessDepositRequest) =>
      adminApi.post<{ status: string }>(`/businesses/${id}/deposit`, body),
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["admin", "businesses", vars.id] }),
  });
}

export function useAdminRMSuggestions() {
  return useQuery({
    queryKey: ["admin", "relationship-managers", "suggestions"],
    queryFn: () =>
      adminApi.get<unknown[]>(`/relationship-managers/suggestions`),
    enabled: false, // manually triggered
  });
}
