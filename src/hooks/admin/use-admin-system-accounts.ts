import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";

export interface CapitalPool {
  label: string;
  account: string;
  balanceCents: number;
  asset: string;
}

interface SystemAccountsResponse {
  pools: CapitalPool[];
}

interface TopUpRequest {
  pool: "loan_capital" | "overdraft_capital";
  amountCents: number;
  asset?: string;
}

export function useAdminSystemAccounts() {
  return useQuery({
    queryKey: ["admin", "system", "accounts"],
    queryFn: () => adminApi.get<SystemAccountsResponse>("/system/accounts"),
  });
}

export function useAdminTopUpCapital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: TopUpRequest) =>
      adminApi.post<{ status: string }>("/system/accounts/top-up", req),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin", "system", "accounts"] }),
  });
}
