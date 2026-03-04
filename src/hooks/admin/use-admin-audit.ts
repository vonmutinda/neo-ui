import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  AuditFilter,
  PaginatedResponse,
  AdminAuditEntry,
} from "@/lib/admin-types";

function buildQuery(filter: AuditFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.action) params.set("action", filter.action);
  if (filter.actorType) params.set("actor_type", filter.actorType);
  if (filter.actorId) params.set("actor_id", filter.actorId);
  if (filter.resourceType) params.set("resource_type", filter.resourceType);
  if (filter.resourceId) params.set("resource_id", filter.resourceId);
  if (filter.createdFrom) params.set("from", filter.createdFrom);
  if (filter.createdTo) params.set("to", filter.createdTo);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.order) params.set("order", filter.order);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminAuditLog(filter: AuditFilter) {
  return useQuery({
    queryKey: ["admin", "audit", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminAuditEntry>>(`/audit${buildQuery(filter)}`),
  });
}

export function useAdminAuditEntry(id: string) {
  return useQuery({
    queryKey: ["admin", "audit", id],
    queryFn: () => adminApi.get<AdminAuditEntry>(`/audit/${id}`),
    enabled: !!id,
  });
}
