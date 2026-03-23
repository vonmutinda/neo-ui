"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";
import type { BusinessTransfer } from "@/lib/business-types";

export function useAdminBusinessTransfers(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "business-transfers", limit, offset],
    queryFn: () =>
      adminApi.get<{ data: BusinessTransfer[]; pagination: PaginationMeta }>(
        `/business-transfers?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminBusinessTransfer(id: string) {
  return useQuery({
    queryKey: ["admin", "business-transfers", id],
    queryFn: () => adminApi.get<BusinessTransfer>(`/business-transfers/${id}`),
    enabled: !!id,
  });
}

export function useAdminPendingBusinessTransfers(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "business-transfers", "pending", limit, offset],
    queryFn: () =>
      adminApi.get<{ data: BusinessTransfer[]; pagination: PaginationMeta }>(
        `/business-transfers/pending?limit=${limit}&offset=${offset}`,
      ),
  });
}
