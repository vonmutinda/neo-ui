"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { PaginationMeta } from "@/lib/admin-types";

export interface AdminBiller {
  id: string;
  code: string;
  name: string;
  category?: string;
  isActive?: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function useAdminBillers(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["admin", "billers", limit, offset],
    queryFn: () =>
      adminApi.get<PaginatedData<AdminBiller>>(
        `/billers?limit=${limit}&offset=${offset}`,
      ),
  });
}
