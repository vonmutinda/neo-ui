"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";

interface AdminBusinessCardInner {
  id: string;
  lastFour: string;
  type: string;
  status: string;
  allowOnline: boolean;
  allowContactless: boolean;
  allowAtm: boolean;
  allowInternational: boolean;
  dailyLimitCents: number;
  monthlyLimitCents: number;
  perTxnLimitCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBusinessCard {
  id: string;
  businessId: string;
  memberId: string;
  cardId: string;
  label: string;
  spendLimitCents: number;
  spentCents: number;
  periodType: string;
  periodResetAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  card?: AdminBusinessCardInner;
  memberName?: string;
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
