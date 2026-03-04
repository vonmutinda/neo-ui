"use client";

import { useState } from "react";
import { useAdminStaffList } from "@/hooks/admin/use-admin-staff";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StaffFilter, StaffRole } from "@/lib/admin-types";

const PAGE_SIZE = 20;

const ROLES: StaffRole[] = [
  "super_admin",
  "customer_support",
  "customer_support_lead",
  "compliance_officer",
  "lending_officer",
  "reconciliation_analyst",
  "card_operations",
  "treasury",
  "auditor",
];

export default function StaffPage() {
  const [filter, setFilter] = useState<StaffFilter>({ limit: PAGE_SIZE, offset: 0 });
  const { data, isLoading } = useAdminStaffList(filter);

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter.role ?? ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, role: (e.target.value || undefined) as StaffRole, offset: 0 }))
          }
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={filter.isActive === undefined ? "" : filter.isActive ? "active" : "inactive"}
          onChange={(e) => {
            const v = e.target.value;
            setFilter((f) => ({
              ...f,
              isActive: v === "" ? undefined : v === "active",
              offset: 0,
            }));
          }}
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Last Login</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No staff found
                </td>
              </tr>
            ) : (
              items.map((staff) => (
                <tr key={staff.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{staff.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{staff.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={staff.role} />
                  </td>
                  <td className="px-4 py-3">{staff.department}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={staff.isActive ? "active" : "deactivated"} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {pagination.offset + 1}–{Math.min(pagination.offset + pagination.limit, pagination.total)} of{" "}
            {pagination.total.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.offset === 0}
              onClick={() => setFilter((f) => ({ ...f, offset: Math.max(0, (f.offset ?? 0) - PAGE_SIZE) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => setFilter((f) => ({ ...f, offset: (f.offset ?? 0) + PAGE_SIZE }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
