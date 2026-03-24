"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  Invoice,
  InvoiceFilter,
  InvoiceSummary,
  PaginatedResult,
} from "@/lib/business-types";

export function useInvoices(bizId: string | null, filter?: InvoiceFilter) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<Invoice>>({
    queryKey: ["business", bizId, "invoices", qs],
    queryFn: () =>
      api.get<PaginatedResult<Invoice>>(
        `/v1/business/${bizId}/invoices${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 15_000,
  });
}

export function useInvoiceSummary(bizId: string | null) {
  return useQuery<InvoiceSummary>({
    queryKey: ["business", bizId, "invoices", "summary"],
    queryFn: () =>
      api.get<InvoiceSummary>(`/v1/business/${bizId}/invoices/summary`),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}
