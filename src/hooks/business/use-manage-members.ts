"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  BusinessMember,
  InviteMemberRequest,
  UpdateMemberRequest,
} from "@/lib/business-types";

export function useInviteMember(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<BusinessMember, Error, InviteMemberRequest>({
    mutationFn: (body) =>
      api.post<BusinessMember>(`/v1/business/${bizId}/members`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "members"] });
    },
  });
}

export function useUpdateMember(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation<
    BusinessMember,
    Error,
    { memberId: string; body: UpdateMemberRequest }
  >({
    mutationFn: ({ memberId, body }) =>
      api.patch<BusinessMember>(
        `/v1/business/${bizId}/members/${memberId}`,
        body,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "members"] });
    },
  });
}

export function useRemoveMember(bizId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      api.delete(`/v1/business/${bizId}/members/${memberId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business", bizId, "members"] });
    },
  });
}
