"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";

interface AdminBusinessCard {
  id: string;
  businessId: string;
  businessName: string;
  memberId: string;
  memberName: string;
  cardId: string;
  label: string;
  last4: string;
  type: string;
  status: string;
  spendLimitCents: number;
  spentCents: number;
  currency: string;
  createdAt: string;
}

export function useAdminBusinessCards(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["admin", "business-cards", limit, offset],
    queryFn: () =>
      adminApi.get<{ data: AdminBusinessCard[]; pagination: PaginationMeta }>(
        `/business-cards?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useAdminBusinessCard(id: string) {
  return useQuery({
    queryKey: ["admin", "business-cards", id],
    queryFn: () => adminApi.get<AdminBusinessCard>(`/business-cards/${id}`),
    enabled: !!id,
  });
}
