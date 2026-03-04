import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  TransactionFilter,
  PaginatedResponse,
  AdminTransaction,
  AdminConversionView,
  ReverseTransactionRequest,
} from "@/lib/admin-types";

function buildQuery(filter: TransactionFilter): string {
  const params = new URLSearchParams();
  if (filter.search) params.set("search", filter.search);
  if (filter.userId) params.set("user_id", filter.userId);
  if (filter.type) params.set("type", filter.type);
  if (filter.status) params.set("status", filter.status);
  if (filter.currency) params.set("currency", filter.currency);
  if (filter.minAmountCents !== undefined) params.set("min_amount", String(filter.minAmountCents));
  if (filter.maxAmountCents !== undefined) params.set("max_amount", String(filter.maxAmountCents));
  if (filter.createdFrom) params.set("from", filter.createdFrom);
  if (filter.createdTo) params.set("to", filter.createdTo);
  if (filter.sort) params.set("sort", filter.sort);
  if (filter.order) params.set("order", filter.order);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminTransactions(filter: TransactionFilter) {
  return useQuery({
    queryKey: ["admin", "transactions", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminTransaction>>(`/transactions${buildQuery(filter)}`),
  });
}

export function useAdminTransaction(id: string) {
  return useQuery({
    queryKey: ["admin", "transactions", id],
    queryFn: () => adminApi.get<AdminTransaction>(`/transactions/${id}`),
    enabled: !!id,
  });
}

export function useAdminConversion(id: string) {
  return useQuery({
    queryKey: ["admin", "transactions", id, "conversion"],
    queryFn: () => adminApi.get<AdminConversionView>(`/transactions/${id}/conversion`),
    enabled: !!id,
  });
}

export function useAdminReverseTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ReverseTransactionRequest & { id: string }) =>
      adminApi.post<void>(`/transactions/${id}/reverse`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "transactions"] }),
  });
}
