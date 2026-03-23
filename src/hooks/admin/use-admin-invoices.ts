"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";
import type { Invoice } from "@/lib/business-types";

export function useAdminInvoices(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "invoices", limit, offset],
    queryFn: () =>
      adminApi.get<{ data: Invoice[]; pagination: PaginationMeta }>(
        `/invoices?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminInvoice(id: string) {
  return useQuery({
    queryKey: ["admin", "invoices", id],
    queryFn: () => adminApi.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}
