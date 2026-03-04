"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  LoanEligibility,
  LoanHistoryPage,
  LoanDetail,
  LoanApplyRequest,
  LoanRepayRequest,
  Loan,
  CreditScore,
  CreditScoreHistory,
} from "@/lib/types";

export function useLoanEligibility() {
  return useQuery<LoanEligibility>({
    queryKey: ["loans", "eligibility"],
    queryFn: () => api.get<LoanEligibility>("/v1/loans/eligibility"),
  });
}

export function useLoanHistory(limit = 20, offset = 0) {
  return useQuery<LoanHistoryPage>({
    queryKey: ["loans", "history", limit, offset],
    queryFn: () =>
      api.get<LoanHistoryPage>(`/v1/loans?limit=${limit}&offset=${offset}`),
  });
}

export function useLoanDetail(id: string) {
  return useQuery<LoanDetail>({
    queryKey: ["loans", id],
    queryFn: () => api.get<LoanDetail>(`/v1/loans/${id}`),
    enabled: !!id,
  });
}

export function useApplyLoan() {
  const qc = useQueryClient();
  return useMutation<Loan, Error, LoanApplyRequest>({
    mutationFn: (req) => api.post<Loan>("/v1/loans/apply", req),
    onSuccess: () => {
      toast.success("Loan approved", { description: "Funds have been disbursed to your wallet" });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Loan application failed", { description: err.message });
    },
  });
}

export function useRepayLoan() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; amountCents: number }>({
    mutationFn: ({ id, amountCents }) =>
      api.post<void>(`/v1/loans/${id}/repay`, { amountCents } satisfies LoanRepayRequest),
    onSuccess: () => {
      toast.success("Payment received", {
        description: "Your loan balance has been updated",
      });
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Repayment failed", { description: err.message });
    },
  });
}

export function useCreditScore() {
  return useQuery<CreditScore>({
    queryKey: ["loans", "credit-score"],
    queryFn: () => api.get<CreditScore>("/v1/loans/credit-score"),
  });
}

export function useCreditScoreHistory() {
  return useQuery<CreditScoreHistory>({
    queryKey: ["loans", "credit-score", "history"],
    queryFn: () => api.get<CreditScoreHistory>("/v1/loans/credit-score/history"),
  });
}
