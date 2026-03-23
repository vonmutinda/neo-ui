"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";

export interface AdminBatchPaymentRow {
  id: string;
  businessId: string;
  name: string;
  totalCents: number;
  currencyCode: string;
  itemCount: number;
  status: string;
  createdAt: string;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function useAdminBatchPaymentList(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "batch-payments", limit, offset],
    queryFn: () =>
      adminApi.get<PaginatedData<AdminBatchPaymentRow>>(
        `/batch-payments?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminBatchPayment(id: string) {
  return useQuery({
    queryKey: ["admin", "batch-payments", id],
    queryFn: () => adminApi.get<AdminBatchPaymentRow>(`/batch-payments/${id}`),
    enabled: !!id,
  });
}
