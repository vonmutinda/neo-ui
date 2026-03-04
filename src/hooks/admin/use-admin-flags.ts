import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  FlagFilter,
  PaginatedResponse,
  AdminFlag,
  CreateFlagRequest,
  ResolveFlagRequest,
} from "@/lib/admin-types";

function buildQuery(filter: FlagFilter): string {
  const params = new URLSearchParams();
  if (filter.severity) params.set("severity", filter.severity);
  if (filter.flagType) params.set("flag_type", filter.flagType);
  if (filter.isResolved !== undefined) params.set("is_resolved", String(filter.isResolved));
  if (filter.userId) params.set("user_id", filter.userId);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminFlags(filter: FlagFilter) {
  return useQuery({
    queryKey: ["admin", "flags", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminFlag>>(`/flags${buildQuery(filter)}`),
  });
}

export function useAdminCreateFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateFlagRequest) => adminApi.post<AdminFlag>("/flags", req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "flags"] }),
  });
}

export function useAdminResolveFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ResolveFlagRequest & { id: string }) =>
      adminApi.post<void>(`/flags/${id}/resolve`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "flags"] }),
  });
}
