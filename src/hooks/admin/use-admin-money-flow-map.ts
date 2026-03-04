import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type { MoneyFlowMapResponse } from "@/lib/admin-types";

function formatDate(d: string | Date): string {
  if (typeof d === "string") return d;
  return d.toISOString().slice(0, 10);
}

export function useAdminMoneyFlowMap(params: {
  from: string | Date;
  to: string | Date;
  limit?: number;
}) {
  const from = formatDate(params.from);
  const to = formatDate(params.to);
  const limit = params.limit ?? 500;
  const query = `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=${limit}`;

  return useQuery({
    queryKey: ["admin", "money-flow-map", from, to, limit],
    queryFn: () =>
      adminApi.get<MoneyFlowMapResponse>(`/analytics/money-flow-map${query}`),
  });
}
