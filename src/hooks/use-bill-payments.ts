"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { paginatedListFromResponse } from "@/lib/api-paginated-list";
import type { Biller, BillPayment, PayBillRequest } from "@/lib/types";

export function useBillers() {
  return useQuery({
    queryKey: ["billers"],
    queryFn: async () => {
      const res = await api.get<unknown>("/v1/billers");
      return paginatedListFromResponse<Biller>(res);
    },
    select: (data: unknown) => paginatedListFromResponse<Biller>(data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBiller(code: string) {
  return useQuery<Biller>({
    queryKey: ["billers", code],
    queryFn: () => api.get<Biller>(`/v1/billers/${code}`),
    enabled: !!code,
  });
}

export function usePayBill() {
  const qc = useQueryClient();
  return useMutation<BillPayment, Error, PayBillRequest>({
    mutationFn: (req) => api.post<BillPayment>("/v1/bill-payments", req),
    onSuccess: () => {
      toast.success("Bill payment submitted");
      qc.invalidateQueries({ queryKey: ["bill-payments"] });
    },
    onError: (err) => {
      toast.error("Failed to pay bill", { description: err.message });
    },
  });
}

export function useBillPayments() {
  return useQuery({
    queryKey: ["bill-payments"],
    queryFn: async () => {
      const res = await api.get<unknown>("/v1/bill-payments");
      return paginatedListFromResponse<BillPayment>(res);
    },
    select: (data: unknown) => paginatedListFromResponse<BillPayment>(data),
  });
}

export function useBillPayment(id: string) {
  return useQuery<BillPayment>({
    queryKey: ["bill-payments", id],
    queryFn: () => api.get<BillPayment>(`/v1/bill-payments/${id}`),
    enabled: !!id,
  });
}
