"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { paginatedListFromResponse } from "@/lib/api-paginated-list";
import type {
  WalletSummary,
  TransactionReceipt,
  SupportedCurrency,
} from "@/lib/types";

export function useWalletSummary() {
  return useQuery<WalletSummary>({
    queryKey: ["wallets", "summary"],
    queryFn: () => api.get<WalletSummary>("/v1/wallets/summary"),
  });
}

export function useTransactions(currency?: SupportedCurrency) {
  const path = currency
    ? `/v1/wallets/transactions?currency=${currency}`
    : "/v1/wallets/transactions";

  return useQuery({
    queryKey: ["wallets", "transactions", currency ?? "all"],
    queryFn: async () => {
      const res = await api.get<unknown>(path);
      return paginatedListFromResponse<TransactionReceipt>(res);
    },
    /** Normalises persisted cache that may still hold pre-fix `PaginatedResult` shapes. */
    select: (data: unknown) =>
      paginatedListFromResponse<TransactionReceipt>(data),
  });
}
