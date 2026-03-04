import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { AdminAnalyticsOverview } from "@/lib/admin-types";

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin", "analytics", "overview"],
    queryFn: () => adminApi.get<AdminAnalyticsOverview>("/analytics/overview"),
    refetchInterval: 60_000,
  });
}
