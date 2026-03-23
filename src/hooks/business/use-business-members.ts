"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { BusinessMember, BusinessPermission } from "@/lib/business-types";

export function useBusinessMembers(bizId: string | null) {
  return useQuery<BusinessMember[]>({
    queryKey: ["business", bizId, "members"],
    queryFn: () => api.get<BusinessMember[]>(`/v1/business/${bizId}/members`),
    enabled: !!bizId,
    staleTime: 60_000,
  });
}

interface PermissionsResponse {
  permissions: BusinessPermission[];
}

export function useMyPermissions(bizId: string | null) {
  return useQuery<BusinessPermission[]>({
    queryKey: ["business", bizId, "permissions", "me"],
    queryFn: async () => {
      const res = await api.get<PermissionsResponse>(
        `/v1/business/${bizId}/members/me/permissions`,
      );
      return res.permissions;
    },
    enabled: !!bizId,
    staleTime: 60_000,
  });
}
