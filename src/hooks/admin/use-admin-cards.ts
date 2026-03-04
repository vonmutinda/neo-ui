import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  CardFilter,
  CardAuthFilter,
  PaginatedResponse,
  AdminCard,
  AdminCardAuthorization,
  UpdateCardLimitsRequest,
} from "@/lib/admin-types";

function buildQuery(filter: CardFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.userId) params.set("user_id", filter.userId);
  if (filter.type) params.set("type", filter.type);
  if (filter.status) params.set("status", filter.status);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.order) params.set("order", filter.order);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminCards(filter: CardFilter) {
  return useQuery({
    queryKey: ["admin", "cards", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminCard>>(`/cards${buildQuery(filter)}`),
  });
}

export function useAdminCard(id: string) {
  return useQuery({
    queryKey: ["admin", "cards", id],
    queryFn: () => adminApi.get<AdminCard>(`/cards/${id}`),
    enabled: !!id,
  });
}

export function useAdminCardAuthorizations(id: string, filter: CardAuthFilter = {}) {
  const params = new URLSearchParams();
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "cards", id, "authorizations", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminCardAuthorization>>(
        `/cards/${id}/authorizations${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!id,
  });
}

export function useAdminFreezeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.post<void>(`/cards/${id}/freeze`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cards"] }),
  });
}

export function useAdminUnfreezeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.post<void>(`/cards/${id}/unfreeze`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cards"] }),
  });
}

export function useAdminCancelCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.post<void>(`/cards/${id}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cards"] }),
  });
}

export function useAdminUpdateCardLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateCardLimitsRequest & { id: string }) =>
      adminApi.patch<void>(`/cards/${id}/limits`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "cards"] }),
  });
}
