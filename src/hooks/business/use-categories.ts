"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  TransactionCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  TaxPot,
  CreateTaxPotRequest,
  UpdateTaxPotRequest,
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

// --- Tax Pots ---

export function useTaxPots(bizId: string | null) {
  return useQuery<TaxPot[]>({
    queryKey: ["business", bizId, "tax-pots"],
    queryFn: () => api.get<TaxPot[]>(`/v1/business/${bizId}/tax-pots`),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useCreateTaxPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<TaxPot, Error, CreateTaxPotRequest>({
    mutationFn: (body) =>
      api.post<TaxPot>(`/v1/business/${bizId}/tax-pots`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "tax-pots"] });
    },
  });
}

export function useUpdateTaxPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    TaxPot,
    Error,
    { taxPotId: string; body: UpdateTaxPotRequest }
  >({
    mutationFn: ({ taxPotId, body }) =>
      api.patch<TaxPot>(`/v1/business/${bizId}/tax-pots/${taxPotId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "tax-pots"] });
    },
  });
}

export function useDeleteTaxPot(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taxPotId: string) =>
      api.delete(`/v1/business/${bizId}/tax-pots/${taxPotId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "tax-pots"] });
    },
  });
}
