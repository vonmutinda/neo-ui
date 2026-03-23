"use client";

import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  SimulateAuthorizeRequest,
  SimulateSettleRequest,
  SimulateReverseRequest,
} from "@/lib/admin-types";

export function useAdminSimulateAuthorize() {
  return useMutation({
    mutationFn: (body: SimulateAuthorizeRequest) =>
      adminApi.post<{ authorizationId: string }>(
        "/cards/simulate/authorize",
        body,
      ),
  });
}

export function useAdminSimulateSettle() {
  return useMutation({
    mutationFn: (body: SimulateSettleRequest) =>
      adminApi.post<void>("/cards/simulate/settle", body),
  });
}

export function useAdminSimulateReverse() {
  return useMutation({
    mutationFn: (body: SimulateReverseRequest) =>
      adminApi.post<void>("/cards/simulate/reverse", body),
  });
}
