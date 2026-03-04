"use client";

import { useState } from "react";
import { useAdminFlags, useAdminCreateFlag, useAdminResolveFlag } from "@/hooks/admin/use-admin-flags";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import type { FlagFilter } from "@/lib/admin-types";

const PAGE_SIZE = 20;

const FLAG_TYPES = [
  "suspicious_activity",
  "aml_alert",
  "fraud_alert",
  "compliance_review",
  "manual_review",
];

function truncate(str: string, len = 40) {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

export default function FlagsPage() {
  const [filter, setFilter] = useState<FlagFilter>({
    isResolved: false,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const { data, isLoading } = useAdminFlags(filter);
  const createFlag = useAdminCreateFlag();
  const resolveFlag = useAdminResolveFlag();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "",
    flagType: FLAG_TYPES[0],
    severity: "warning" as "info" | "warning" | "critical",
    description: "",
  });

  const [resolvingFlagId, setResolvingFlagId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  function handleCreate() {
    if (!createForm.userId.trim() || !createForm.description.trim()) {
      toast.error("User ID and description are required");
      return;
    }
    createFlag.mutate(createForm, {
      onSuccess: () => {
        toast.success("Flag created successfully");
        setShowCreateDialog(false);
        setCreateForm({ userId: "", flagType: FLAG_TYPES[0], severity: "warning", description: "" });
      },
      onError: () => toast.error("Failed to create flag"),
    });
  }

  function handleResolve() {
    if (!resolvingFlagId || !resolutionNote.trim()) {
      toast.error("Resolution note is required");
      return;
    }
    resolveFlag.mutate(
      { id: resolvingFlagId, resolutionNote: resolutionNote.trim() },
      {
        onSuccess: () => {
          toast.success("Flag resolved successfully");
          setResolvingFlagId(null);
          setResolutionNote("");
        },
        onError: () => toast.error("Failed to resolve flag"),
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter.severity ?? ""}
          onChange={(e) =>
            setFilter((f) => ({ ...f, severity: (e.target.value || undefined) as FlagFilter["severity"], offset: 0 }))
          }
          className="h-10 rounded-[10px] border border-input bg-background px-3 text-sm"
        >
          <option value="">All severities</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filter.isResolved === false}
            onChange={(e) =>
              setFilter((f) => ({ ...f, isResolved: e.target.checked ? false : undefined, offset: 0 }))
            }
          />
          Unresolved only
        </label>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Flag
        </Button>
      </div>

      {showCreateDialog && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Create New Flag</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">User ID *</label>
              <Input
                placeholder="Enter user ID"
                value={createForm.userId}
                onChange={(e) => setCreateForm((f) => ({ ...f, userId: e.target.value }))}
                className="h-10 rounded-[10px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Flag Type</label>
              <select
                value={createForm.flagType}
                onChange={(e) => setCreateForm((f) => ({ ...f, flagType: e.target.value }))}
                className="h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm"
              >
                {FLAG_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Severity</label>
              <select
                value={createForm.severity}
                onChange={(e) => setCreateForm((f) => ({ ...f, severity: e.target.value as "info" | "warning" | "critical" }))}
                className="h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm"
              >
                <option value="info">info</option>
                <option value="warning">warning</option>
                <option value="critical">critical</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Description *</label>
              <textarea
                placeholder="Describe the flag reason..."
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={createFlag.isPending}>
              {createFlag.isPending ? "Creating..." : "Create"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {resolvingFlagId && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Resolve Flag</h3>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Resolution Note *</label>
            <textarea
              placeholder="Describe the resolution..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              rows={3}
              className="w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleResolve} disabled={resolveFlag.isPending}>
              {resolveFlag.isPending ? "Resolving..." : "Resolve"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setResolvingFlagId(null); setResolutionNote(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Severity</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No flags found
                </td>
              </tr>
            ) : (
              items.map((flag) => (
                <tr key={flag.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {flag.userId ? flag.userId.slice(0, 8) + "..." : "—"}
                  </td>
                  <td className="px-4 py-3">{flag.flagType?.replace(/_/g, " ") ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={flag.severity} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{truncate(flag.description)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {flag.isResolved ? (
                      <StatusBadge status="resolved" />
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setResolvingFlagId(flag.id); setResolutionNote(""); }}
                      >
                        Resolve
                      </Button>
                    )}
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
