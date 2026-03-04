"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  InboundTransferRequest,
  OutboundTransferRequest,
  TransferResponse,
  BatchTransferRequest,
  BatchTransferResponse,
} from "@/lib/types";

export function useInboundTransfer() {
  const qc = useQueryClient();
  return useMutation<TransferResponse, Error, InboundTransferRequest>({
    mutationFn: (req) => api.post<TransferResponse>("/v1/transfers/inbound", req),
    onSuccess: () => {
      toast.success("Transfer sent successfully");
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
    },
    onError: (err) => {
      toast.error("Transfer failed", { description: err.message });
    },
  });
}

export function useOutboundTransfer() {
  const qc = useQueryClient();
  return useMutation<TransferResponse, Error, OutboundTransferRequest>({
    mutationFn: (req) => api.post<TransferResponse>("/v1/transfers/outbound", req),
    onSuccess: () => {
      toast.success("Transfer initiated", { description: "Processing via EthSwitch" });
      qc.invalidateQueries({ queryKey: ["wallets"] });
    },
    onError: (err) => {
      toast.error("Transfer failed", { description: err.message });
    },
  });
}

export function useBatchTransfer() {
  const qc = useQueryClient();
  return useMutation<BatchTransferResponse, Error, BatchTransferRequest>({
    mutationFn: (req) =>
      api.post<BatchTransferResponse>("/v1/transfers/batch", req),
    onSuccess: (result) => {
      toast.success("Batch transfer sent", {
        description: `Sent to ${result.recipientCount} recipients`,
      });
      qc.invalidateQueries({ queryKey: ["wallets"] });
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["recipients"] });
    },
    onError: (err) => {
      toast.error("Batch transfer failed", { description: err.message });
    },
  });
}
