"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  SpendingCategory,
  SpendingSummary,
  SpendingTrend,
} from "@/lib/types";

interface AnalyticsParams {
  currency?: string;
  from?: string;
  to?: string;
}

function buildQs(params?: AnalyticsParams): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  if (params.currency) qs.set("currency", params.currency);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export function useSpendingByCategory(params?: AnalyticsParams) {
  return useQuery<SpendingCategory[]>({
    queryKey: ["analytics", "spending", params],
    queryFn: () =>
      api.get<SpendingCategory[]>(`/v1/analytics/spending${buildQs(params)}`),
  });
}

export function useSpendingSummary(params?: AnalyticsParams) {
  return useQuery<SpendingSummary>({
    queryKey: ["analytics", "summary", params],
    queryFn: () =>
      api.get<SpendingSummary>(`/v1/analytics/summary${buildQs(params)}`),
  });
}

export function useSpendingTrends(params?: AnalyticsParams) {
  return useQuery<SpendingTrend[]>({
    queryKey: ["analytics", "trends", params],
    queryFn: () =>
      api.get<SpendingTrend[]>(`/v1/analytics/trends${buildQs(params)}`),
  });
}
