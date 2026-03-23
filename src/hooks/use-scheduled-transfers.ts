"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  ScheduledTransfer,
  CreateScheduledTransferRequest,
} from "@/lib/types";

export function useScheduledTransfers() {
  return useQuery<ScheduledTransfer[]>({
    queryKey: ["scheduled-transfers"],
    queryFn: () => api.get<ScheduledTransfer[]>("/v1/transfers/scheduled"),
  });
}

export function useScheduledTransfer(id: string) {
  return useQuery<ScheduledTransfer>({
    queryKey: ["scheduled-transfers", id],
    queryFn: () => api.get<ScheduledTransfer>(`/v1/transfers/scheduled/${id}`),
    enabled: !!id,
  });
}

export function useCreateScheduledTransfer() {
  const qc = useQueryClient();
  return useMutation<ScheduledTransfer, Error, CreateScheduledTransferRequest>({
    mutationFn: (req) =>
      api.post<ScheduledTransfer>("/v1/transfers/scheduled", req),
    onSuccess: () => {
      toast.success("Scheduled transfer created");
      qc.invalidateQueries({ queryKey: ["scheduled-transfers"] });
    },
    onError: (err) => {
      toast.error("Failed to create scheduled transfer", {
        description: err.message,
      });
    },
  });
}

export function useUpdateScheduledTransfer() {
  const qc = useQueryClient();
  return useMutation<
    ScheduledTransfer,
    Error,
    { id: string; data: Partial<CreateScheduledTransferRequest> }
  >({
    mutationFn: ({ id, data }) =>
      api.patch<ScheduledTransfer>(`/v1/transfers/scheduled/${id}`, data),
    onSuccess: (_, { id }) => {
      toast.success("Scheduled transfer updated");
      qc.invalidateQueries({ queryKey: ["scheduled-transfers"] });
      qc.invalidateQueries({ queryKey: ["scheduled-transfers", id] });
    },
    onError: (err) => {
      toast.error("Failed to update scheduled transfer", {
        description: err.message,
      });
    },
  });
}

export function useCancelScheduledTransfer() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => api.delete<void>(`/v1/transfers/scheduled/${id}`),
    onSuccess: () => {
      toast.success("Scheduled transfer cancelled");
      qc.invalidateQueries({ queryKey: ["scheduled-transfers"] });
    },
    onError: (err) => {
      toast.error("Failed to cancel scheduled transfer", {
        description: err.message,
      });
    },
  });
}

export function usePauseScheduledTransfer() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.post<void>(`/v1/transfers/scheduled/${id}/pause`, {}),
    onSuccess: (_, id) => {
      toast.success("Scheduled transfer paused");
      qc.invalidateQueries({ queryKey: ["scheduled-transfers"] });
      qc.invalidateQueries({ queryKey: ["scheduled-transfers", id] });
    },
    onError: (err) => {
      toast.error("Failed to pause scheduled transfer", {
        description: err.message,
      });
    },
  });
}

export function useResumeScheduledTransfer() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.post<void>(`/v1/transfers/scheduled/${id}/resume`, {}),
    onSuccess: (_, id) => {
      toast.success("Scheduled transfer resumed");
      qc.invalidateQueries({ queryKey: ["scheduled-transfers"] });
      qc.invalidateQueries({ queryKey: ["scheduled-transfers", id] });
    },
    onError: (err) => {
      toast.error("Failed to resume scheduled transfer", {
        description: err.message,
      });
    },
  });
}
