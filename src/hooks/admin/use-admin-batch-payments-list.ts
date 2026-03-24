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

export interface AdminBatchPaymentItem {
  id: string;
  batchId: string;
  recipientName: string;
  recipientPhone?: string;
  recipientBank?: string;
  recipientAccount?: string;
  amountCents: number;
  narration?: string;
  status: string;
  transactionId?: string;
  errorMessage?: string;
}

export interface AdminBatchPaymentDetail {
  batch: AdminBatchPaymentRow;
  items: AdminBatchPaymentItem[];
}

export function useAdminBatchPayment(id: string) {
  return useQuery({
    queryKey: ["admin", "batch-payments", id],
    queryFn: () =>
      adminApi.get<AdminBatchPaymentDetail>(`/batch-payments/${id}`),
    enabled: !!id,
  });
}
