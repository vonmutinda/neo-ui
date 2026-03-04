import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  StaffFilter,
  PaginatedResponse,
  AdminStaff,
  AdminCreateStaffRequest,
  AdminUpdateStaffRequest,
} from "@/lib/admin-types";

function buildQuery(filter: StaffFilter): string {
  const params = new URLSearchParams();
  if (filter.role) params.set("role", filter.role);
  if (filter.isActive !== undefined) params.set("is_active", String(filter.isActive));
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminStaffList(filter: StaffFilter = {}) {
  return useQuery({
    queryKey: ["admin", "staff", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminStaff>>(`/staff${buildQuery(filter)}`),
  });
}

export function useAdminStaffMember(id: string) {
  return useQuery({
    queryKey: ["admin", "staff", id],
    queryFn: () => adminApi.get<AdminStaff>(`/staff/${id}`),
    enabled: !!id,
  });
}

export function useAdminCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AdminCreateStaffRequest) =>
      adminApi.post<AdminStaff>("/staff", req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
}

export function useAdminUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: AdminUpdateStaffRequest & { id: string }) =>
      adminApi.patch<AdminStaff>(`/staff/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
}

export function useAdminDeactivateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete<void>(`/staff/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
}
