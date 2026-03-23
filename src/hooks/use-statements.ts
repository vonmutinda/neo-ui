"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Statement, RequestStatementBody } from "@/lib/types";

export function useStatements() {
  return useQuery<Statement[]>({
    queryKey: ["statements"],
    queryFn: () => api.get<Statement[]>("/v1/statements"),
  });
}

export function useRequestStatement() {
  const qc = useQueryClient();
  return useMutation<Statement, Error, RequestStatementBody>({
    mutationFn: (req) => api.post<Statement>("/v1/statements", req),
    onSuccess: () => {
      toast.success("Statement requested");
      qc.invalidateQueries({ queryKey: ["statements"] });
    },
    onError: (err) => {
      toast.error("Failed to request statement", {
        description: err.message,
      });
    },
  });
}

export function useStatement(id: string) {
  return useQuery<Statement>({
    queryKey: ["statements", id],
    queryFn: () => api.get<Statement>(`/v1/statements/${id}`),
    enabled: !!id,
  });
}
