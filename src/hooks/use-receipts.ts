"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { TransactionReceipt } from "@/lib/types";

export function useReceipt(id: string) {
  return useQuery<TransactionReceipt>({
    queryKey: ["receipts", id],
    queryFn: () => api.get<TransactionReceipt>(`/v1/receipts/${id}`),
    enabled: !!id,
  });
}

export function useReceiptPdf(id: string) {
  return useMutation<Blob, Error, void>({
    mutationFn: async () => {
      const blob = await api.get<Blob>(`/v1/receipts/${id}/pdf`);
      return blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    },
    onError: (err) => {
      toast.error("Failed to download receipt", { description: err.message });
    },
  });
}
