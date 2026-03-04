import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  CustomerFilter,
  PaginatedResponse,
  AdminTransaction,
  AdminCustomerProfile,
  AdminFlag,
  FreezeRequest,
  KYCOverrideRequest,
  AddNoteRequest,
} from "@/lib/admin-types";

function buildQuery(filter: CustomerFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.kycLevel !== undefined) params.set("kyc_level", String(filter.kycLevel));
  if (filter.isFrozen !== undefined) params.set("is_frozen", String(filter.isFrozen));
  if (filter.createdFrom) params.set("from", filter.createdFrom);
  if (filter.createdTo) params.set("to", filter.createdTo);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.order) params.set("order", filter.order);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminCustomers(filter: CustomerFilter) {
  return useQuery({
    queryKey: ["admin", "customers", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminTransaction>>(`/customers${buildQuery(filter)}`),
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: ["admin", "customers", id],
    queryFn: () => adminApi.get<AdminCustomerProfile>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useAdminCustomerFlags(id: string) {
  return useQuery({
    queryKey: ["admin", "customers", id, "flags"],
    queryFn: () => adminApi.get<AdminFlag[]>(`/customers/${id}/flags`),
    enabled: !!id,
  });
}

export function useAdminFreezeCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: FreezeRequest & { id: string }) =>
      adminApi.post<void>(`/customers/${id}/freeze`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}

export function useAdminUnfreezeCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.post<void>(`/customers/${id}/unfreeze`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}

export function useAdminKYCOverride() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: KYCOverrideRequest & { id: string }) =>
      adminApi.post<void>(`/customers/${id}/kyc-override`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}

export function useAdminAddNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: AddNoteRequest & { id: string }) =>
      adminApi.post<void>(`/customers/${id}/note`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}
