"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  TransactionLabel,
  LabeledTransactionFilter,
  TaxSummaryRow,
  TaxPotSummaryItem,
  PaginatedResult,
} from "@/lib/business-types";

interface AccountingReport {
  generatedAt: string;
  periodFrom: string;
  periodTo: string;
  data: unknown;
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
        `/v1/business/${bizId}/wallets/transactions/export${qsStr ? `?${qsStr}` : ""}`,
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
  return useQuery<TaxSummaryRow[]>({
    queryKey: ["business", bizId, "tax-summary"],
    queryFn: () =>
      api.get<TaxSummaryRow[]>(
        `/v1/business/${bizId}/transactions/tax-summary`,
      ),
    enabled: !!bizId,
  });
}

export function useLabeledTransactions(
  bizId: string | null,
  params?: LabeledTransactionFilter,
) {
  const qs = new URLSearchParams();
  if (params?.categoryId) qs.set("category_id", params.categoryId);
  if (params?.taxDeductible != null)
    qs.set("tax_deductible", String(params.taxDeductible));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const qsStr = qs.toString();

  return useQuery<PaginatedResult<TransactionLabel>>({
    queryKey: ["business", bizId, "labeled-transactions", params],
    queryFn: () =>
      api.get<PaginatedResult<TransactionLabel>>(
        `/v1/business/${bizId}/transactions/labeled${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId,
  });
}

export function useTaxPotSummary(bizId: string | null) {
  return useQuery<TaxPotSummaryItem[]>({
    queryKey: ["business", bizId, "tax-pots", "summary"],
    queryFn: () =>
      api.get<TaxPotSummaryItem[]>(`/v1/business/${bizId}/tax-pots/summary`),
    enabled: !!bizId,
  });
}
