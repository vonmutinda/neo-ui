import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  LoanFilter,
  PaginatedResponse,
  AdminLoan,
  AdminLoanDetail,
  AdminLoanBookSummary,
  AdminCreditProfile,
  WriteOffLoanRequest,
  CreditOverrideRequest,
} from "@/lib/admin-types";

function buildQuery(filter: LoanFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.userId) params.set("user_id", filter.userId);
  if (filter.status) params.set("status", filter.status);
  if (filter.createdFrom) params.set("from", filter.createdFrom);
  if (filter.createdTo) params.set("to", filter.createdTo);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.order) params.set("order", filter.order);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminLoans(filter: LoanFilter) {
  return useQuery({
    queryKey: ["admin", "loans", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminLoan>>(`/loans${buildQuery(filter)}`),
  });
}

export function useAdminLoanSummary() {
  return useQuery({
    queryKey: ["admin", "loans", "summary"],
    queryFn: () => adminApi.get<AdminLoanBookSummary>("/loans/summary"),
  });
}

export function useAdminLoan(id: string) {
  return useQuery({
    queryKey: ["admin", "loans", id],
    queryFn: () => adminApi.get<AdminLoanDetail>(`/loans/${id}`),
    enabled: !!id,
  });
}

export function useAdminWriteOffLoan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: WriteOffLoanRequest & { id: string }) =>
      adminApi.post<void>(`/loans/${id}/write-off`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "loans"] }),
  });
}

export function useAdminCreditProfiles(
  filter: { limit?: number; offset?: number } = {},
) {
  const params = new URLSearchParams();
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "credit-profiles", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminCreditProfile>>(
        `/credit-profiles${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function useAdminCreditProfile(userId: string) {
  return useQuery({
    queryKey: ["admin", "credit-profiles", userId],
    queryFn: () =>
      adminApi.get<AdminCreditProfile>(`/credit-profiles/${userId}`),
    enabled: !!userId,
  });
}

export function useAdminOverrideCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      ...body
    }: CreditOverrideRequest & { userId: string }) =>
      adminApi.post<void>(`/credit-profiles/${userId}/override`, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "credit-profiles"] });
      qc.invalidateQueries({
        queryKey: ["admin", "customers", variables.userId],
      });
    },
  });
}
