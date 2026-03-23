"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";

/** Minimal shape for admin bill payment list rows */
export interface AdminBillPaymentRow {
  id: string;
  userId?: string;
  billerCode?: string;
  amountCents?: number;
  status?: string;
  createdAt?: string;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function useAdminBillPayments(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "bill-payments", limit, offset],
    queryFn: () =>
      adminApi.get<PaginatedData<AdminBillPaymentRow>>(
        `/bill-payments?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminBillPayment(id: string) {
  return useQuery({
    queryKey: ["admin", "bill-payments", id],
    queryFn: () => adminApi.get<AdminBillPaymentRow>(`/bill-payments/${id}`),
    enabled: !!id,
  });
}
