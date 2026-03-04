import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";
import type {
  ExceptionFilter,
  PaginatedResponse,
  AdminReconRun,
  AdminReconException,
  AssignExceptionRequest,
  InvestigateExceptionRequest,
  ResolveExceptionRequest,
  EscalateExceptionRequest,
} from "@/lib/admin-types";

function buildExceptionQuery(filter: ExceptionFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.errorType) params.set("error_type", filter.errorType);
  if (filter.assignedTo) params.set("assigned_to", filter.assignedTo);
  if (filter.createdFrom) params.set("from", filter.createdFrom);
  if (filter.createdTo) params.set("to", filter.createdTo);
  if (filter.limit !== undefined) params.set("limit", String(filter.limit));
  if (filter.offset !== undefined) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminReconRuns(pagination: { limit?: number; offset?: number } = {}) {
  const params = new URLSearchParams();
  if (pagination.limit !== undefined) params.set("limit", String(pagination.limit));
  if (pagination.offset !== undefined) params.set("offset", String(pagination.offset));
  const qs = params.toString();
  return useQuery({
    queryKey: ["admin", "recon", "runs", pagination],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminReconRun>>(
        `/reconciliation/runs${qs ? `?${qs}` : ""}`,
      ),
  });
}

export function useAdminReconExceptions(filter: ExceptionFilter) {
  return useQuery({
    queryKey: ["admin", "recon", "exceptions", filter],
    queryFn: () =>
      adminApi.get<PaginatedResponse<AdminReconException>>(
        `/reconciliation/exceptions${buildExceptionQuery(filter)}`,
      ),
  });
}

export function useAdminAssignException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: AssignExceptionRequest & { id: string }) =>
      adminApi.post<void>(`/reconciliation/exceptions/${id}/assign`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "recon"] }),
  });
}

export function useAdminInvestigateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: InvestigateExceptionRequest & { id: string }) =>
      adminApi.post<void>(`/reconciliation/exceptions/${id}/investigate`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "recon"] }),
  });
}

export function useAdminResolveException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ResolveExceptionRequest & { id: string }) =>
      adminApi.post<void>(`/reconciliation/exceptions/${id}/resolve`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "recon"] }),
  });
}

export function useAdminEscalateException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: EscalateExceptionRequest & { id: string }) =>
      adminApi.post<void>(`/reconciliation/exceptions/${id}/escalate`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "recon"] }),
  });
}
