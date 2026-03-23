"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessLoan,
  BusinessLoanEligibility,
  BusinessLoanFilter,
  ApplyLoanRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useLoanEligibility(bizId: string | null) {
  return useQuery<BusinessLoanEligibility>({
    queryKey: ["business", bizId, "loans", "eligibility"],
    queryFn: () =>
      api.get<BusinessLoanEligibility>(
        `/v1/business/${bizId}/loans/eligibility`,
      ),
    enabled: !!bizId,
    staleTime: 60_000,
  });
}

export function useBusinessLoans(
  bizId: string | null,
  filter?: BusinessLoanFilter,
) {
  const params = new URLSearchParams();
  if (filter?.status) params.set("status", filter.status);
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessLoan>>({
    queryKey: ["business", bizId, "loans", filter],
    queryFn: () =>
      api.get<PaginatedResult<BusinessLoan>>(
        `/v1/business/${bizId}/loans${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useBusinessLoanDetail(
  bizId: string | null,
  loanId: string | null,
) {
  return useQuery<BusinessLoan>({
    queryKey: ["business", bizId, "loans", loanId],
    queryFn: () =>
      api.get<BusinessLoan>(`/v1/business/${bizId}/loans/${loanId}`),
    enabled: !!bizId && !!loanId,
  });
}

export function useApplyForLoan(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessLoan, Error, ApplyLoanRequest>({
    mutationFn: (body) =>
      api.post<BusinessLoan>(`/v1/business/${bizId}/loans/apply`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "loans"] });
    },
  });
}
