"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  TransactionCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/lib/business-types";

// --- Transaction Categories ---

export function useCategories(bizId: string | null) {
  return useQuery<TransactionCategory[]>({
    queryKey: ["business", bizId, "categories"],
    queryFn: () =>
      api.get<TransactionCategory[]>(`/v1/business/${bizId}/categories`),
    enabled: !!bizId,
    staleTime: 60_000,
  });
}

export function useCreateCategory(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<TransactionCategory, Error, CreateCategoryRequest>({
    mutationFn: (body) =>
      api.post<TransactionCategory>(`/v1/business/${bizId}/categories`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "categories"] });
    },
  });
}

export function useUpdateCategory(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    TransactionCategory,
    Error,
    { categoryId: string; body: UpdateCategoryRequest }
  >({
    mutationFn: ({ categoryId, body }) =>
      api.patch<TransactionCategory>(
        `/v1/business/${bizId}/categories/${categoryId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "categories"] });
    },
  });
}

export function useDeleteCategory(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      api.delete(`/v1/business/${bizId}/categories/${categoryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "categories"] });
    },
  });
}
