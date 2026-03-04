"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { WalletSummary, TransactionReceipt, SupportedCurrency } from "@/lib/types";

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

  return useQuery<TransactionReceipt[]>({
    queryKey: ["wallets", "transactions", currency ?? "all"],
    queryFn: () => api.get<TransactionReceipt[]>(path),
  });
}
