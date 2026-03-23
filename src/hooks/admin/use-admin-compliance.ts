"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/admin-api-client";

interface ComplianceReport {
  generatedAt: string;
  totalCustomers: number;
  kycLevelBreakdown: { level: number; count: number }[];
  flaggedAccounts: number;
  pendingReviews: number;
  suspendedAccounts: number;
  recentFlags: {
    id: string;
    customerId: string;
    reason: string;
    createdAt: string;
  }[];
}

export function useAdminComplianceReport() {
  return useQuery({
    queryKey: ["admin", "compliance", "report"],
    queryFn: () => adminApi.get<ComplianceReport>(`/compliance/report`),
  });
}
