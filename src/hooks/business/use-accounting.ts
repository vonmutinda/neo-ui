"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

interface AccountingReport {
  generatedAt: string;
  periodFrom: string;
  periodTo: string;
  data: unknown;
}

interface TaxSummary {
  categories: {
    id: string;
    name: string;
    totalCents: number;
    transactionCount: number;
  }[];
  totalCents: number;
}

export function useExportTransactions(
  bizId: string | null,
  params?: { from?: string; to?: string; format?: string },
) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  if (params?.format) qs.set("format", params.format);
  const qsStr = qs.toString();

  return useQuery<Blob>({
    queryKey: ["business", bizId, "export-transactions", params],
    queryFn: () =>
      api.get<Blob>(
        `/v1/business/${bizId}/export/transactions${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: false, // manually triggered
  });
}

export function useProfitAndLoss(
  bizId: string | null,
  params?: { from?: string; to?: string },
) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const qsStr = qs.toString();

  return useQuery<AccountingReport>({
    queryKey: ["business", bizId, "profit-loss", params],
    queryFn: () =>
      api.get<AccountingReport>(
        `/v1/business/${bizId}/export/profit-loss${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId,
  });
}

export function useBalanceSheet(
  bizId: string | null,
  params?: { from?: string; to?: string },
) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const qsStr = qs.toString();

  return useQuery<AccountingReport>({
    queryKey: ["business", bizId, "balance-sheet", params],
    queryFn: () =>
      api.get<AccountingReport>(
        `/v1/business/${bizId}/export/balance-sheet${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId,
  });
}

export function useTaxReport(
  bizId: string | null,
  params?: { from?: string; to?: string },
) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const qsStr = qs.toString();

  return useQuery<AccountingReport>({
    queryKey: ["business", bizId, "tax-report", params],
    queryFn: () =>
      api.get<AccountingReport>(
        `/v1/business/${bizId}/export/tax-report${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId,
  });
}

export function useTaxSummary(bizId: string | null) {
  return useQuery<TaxSummary>({
    queryKey: ["business", bizId, "tax-summary"],
    queryFn: () =>
      api.get<TaxSummary>(`/v1/business/${bizId}/transactions/tax-summary`),
    enabled: !!bizId,
  });
}

export function useLabeledTransactions(
  bizId: string | null,
  params?: { categoryId?: string; limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.categoryId) qs.set("categoryId", params.categoryId);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const qsStr = qs.toString();

  return useQuery({
    queryKey: ["business", bizId, "labeled-transactions", params],
    queryFn: () =>
      api.get(
        `/v1/business/${bizId}/transactions/labeled${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId,
  });
}
