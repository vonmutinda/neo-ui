"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  PaymentRequest,
  CreatePaymentRequestBody,
  DeclinePaymentRequestBody,
  PendingCountResponse,
  BatchPaymentRequestBody,
  BatchPaymentRequestResponse,
} from "@/lib/types";

export function useSentRequests(limit = 20, offset = 0) {
  return useQuery<PaymentRequest[]>({
    queryKey: ["payment-requests", "sent", limit, offset],
    queryFn: () =>
      api.get<PaymentRequest[]>(
        `/v1/payment-requests/sent?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function useReceivedRequests(limit = 20, offset = 0) {
  return useQuery<PaymentRequest[]>({
    queryKey: ["payment-requests", "received", limit, offset],
    queryFn: () =>
      api.get<PaymentRequest[]>(
        `/v1/payment-requests/received?limit=${limit}&offset=${offset}`,
      ),
  });
}

export function usePendingRequestCount() {
  return useQuery<PendingCountResponse>({
    queryKey: ["payment-requests", "pending-count"],
    queryFn: () =>
      api.get<PendingCountResponse>("/v1/payment-requests/received/count"),
    refetchInterval: 30_000,
  });
}

export function usePaymentRequest(id: string) {
  return useQuery<PaymentRequest>({
    queryKey: ["payment-requests", id],
    queryFn: () => api.get<PaymentRequest>(`/v1/payment-requests/${id}`),
    enabled: !!id,
  });
}

export function useCreatePaymentRequest() {
  const qc = useQueryClient();
  return useMutation<PaymentRequest, Error, CreatePaymentRequestBody>({
    mutationFn: (req) =>
      api.post<PaymentRequest>("/v1/payment-requests", req),
    onSuccess: () => {
      toast.success("Request sent", {
        description: "They'll be notified to pay you",
      });
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
    },
    onError: (err) => {
      toast.error("Failed to send request", { description: err.message });
    },
  });
}

export function usePayRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.post<void>(`/v1/payment-requests/${id}/pay`, {}),
    onSuccess: () => {
      toast.success("Payment sent", {
        description: "The request has been fulfilled",
      });
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Payment failed", { description: err.message });
    },
  });
}

export function useDeclineRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; body?: DeclinePaymentRequestBody }>({
    mutationFn: ({ id, body }) =>
      api.post<void>(`/v1/payment-requests/${id}/decline`, body ?? {}),
    onSuccess: () => {
      toast.success("Request declined");
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
    },
    onError: (err) => {
      toast.error("Failed to decline", { description: err.message });
    },
  });
}

export function useCancelRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete<void>(`/v1/payment-requests/${id}`),
    onSuccess: () => {
      toast.success("Request cancelled");
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
    },
    onError: (err) => {
      toast.error("Failed to cancel", { description: err.message });
    },
  });
}

export function useRemindRequest() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.post<void>(`/v1/payment-requests/${id}/remind`, {}),
    onSuccess: () => {
      toast.success("Reminder sent");
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
    },
    onError: (err) => {
      toast.error("Failed to send reminder", { description: err.message });
    },
  });
}

export function useCreateBatchPaymentRequest() {
  const qc = useQueryClient();
  return useMutation<BatchPaymentRequestResponse, Error, BatchPaymentRequestBody>({
    mutationFn: (req) =>
      api.post<BatchPaymentRequestResponse>("/v1/payment-requests/batch", req),
    onSuccess: (result) => {
      toast.success("Split request sent", {
        description: `Requested from ${result.recipientCount} people`,
      });
      qc.invalidateQueries({ queryKey: ["payment-requests"] });
    },
    onError: (err) => {
      toast.error("Failed to send split request", { description: err.message });
    },
  });
}
