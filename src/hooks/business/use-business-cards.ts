"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessCard,
  BusinessCardFilter,
  BusinessCardAuthorization,
  IssueBusinessCardRequest,
  UpdateCardLimitsRequest,
  PaginatedResult,
} from "@/lib/business-types";

export function useBusinessCards(
  bizId: string | null,
  filter?: BusinessCardFilter,
) {
  const params = new URLSearchParams();
  if (filter?.limit) params.set("limit", String(filter.limit));
  if (filter?.offset) params.set("offset", String(filter.offset));
  const qs = params.toString();

  return useQuery<PaginatedResult<BusinessCard>>({
    queryKey: ["business", bizId, "cards", qs],
    queryFn: () =>
      api.get<PaginatedResult<BusinessCard>>(
        `/v1/business/${bizId}/cards${qs ? `?${qs}` : ""}`,
      ),
    enabled: !!bizId,
    staleTime: 30_000,
  });
}

export function useBusinessCardDetail(
  bizId: string | null,
  cardId: string | null,
) {
  return useQuery<BusinessCard>({
    queryKey: ["business", bizId, "cards", cardId],
    queryFn: () =>
      api.get<BusinessCard>(`/v1/business/${bizId}/cards/${cardId}`),
    enabled: !!bizId && !!cardId,
  });
}

export function useIssueCard(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessCard, Error, IssueBusinessCardRequest>({
    mutationFn: (body) =>
      api.post<BusinessCard>(`/v1/business/${bizId}/cards`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "cards"] });
    },
  });
}

export function useUpdateCardLimits(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { cardId: string; body: UpdateCardLimitsRequest }
  >({
    mutationFn: ({ cardId, body }) =>
      api.patch(`/v1/business/${bizId}/cards/${cardId}/limits`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "cards"] });
    },
  });
}

export function useFreezeCard(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) =>
      api.post(`/v1/business/${bizId}/cards/${cardId}/freeze`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "cards"] });
    },
  });
}

export function useUnfreezeCard(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) =>
      api.post(`/v1/business/${bizId}/cards/${cardId}/unfreeze`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "cards"] });
    },
  });
}

export function useCancelCard(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) =>
      api.post(`/v1/business/${bizId}/cards/${cardId}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "cards"] });
    },
  });
}

export function useBusinessCardAuthorizations(
  bizId: string | null,
  cardId: string | null,
  params?: { limit?: number; offset?: number },
) {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.offset) qs.set("offset", String(params.offset));
  const qsStr = qs.toString();

  return useQuery<PaginatedResult<BusinessCardAuthorization>>({
    queryKey: ["business", bizId, "cards", cardId, "authorizations", params],
    queryFn: () =>
      api.get<PaginatedResult<BusinessCardAuthorization>>(
        `/v1/business/${bizId}/cards/${cardId}/authorizations${qsStr ? `?${qsStr}` : ""}`,
      ),
    enabled: !!bizId && !!cardId,
  });
}
