"use client";

import { use, useState } from "react";
import {
  useAdminBusiness,
  useAdminFreezeBusiness,
  useAdminUnfreezeBusiness,
  useAdminUpdateBusinessStatus,
  useAdminAddBusinessNote,
  useAdminAssignRM,
  useAdminRelationshipManagers,
} from "@/hooks/admin/use-admin-businesses";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Snowflake, Sun, UserPlus, StickyNote } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: business, isLoading } = useAdminBusiness(id);
  const { data: rms } = useAdminRelationshipManagers();
  const freeze = useAdminFreezeBusiness();
  const unfreeze = useAdminUnfreezeBusiness();
  const updateStatus = useAdminUpdateBusinessStatus();
  const addNote = useAdminAddBusinessNote();
  const assignRM = useAdminAssignRM();

  const [newStatus, setNewStatus] = useState("");
  const [newKybLevel, setNewKybLevel] = useState("");
  const [selectedRM, setSelectedRM] = useState("");
  const [noteText, setNoteText] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Business not found
      </p>
    );
  }

  function handleFreeze() {
    freeze.mutate(
      { id, reason: "Frozen by admin" },
      {
        onSuccess: () => toast.success("Business frozen"),
        onError: () => toast.error("Failed to freeze business"),
      },
    );
  }

  function handleUnfreeze() {
    unfreeze.mutate(id, {
      onSuccess: () => toast.success("Business unfrozen"),
      onError: () => toast.error("Failed to unfreeze business"),
    });
  }

  function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatus) return;
    updateStatus.mutate(
      { id, status: newStatus, reason: "Updated by admin" },
      {
        onSuccess: () => {
          toast.success("Status updated");
          setNewStatus("");
          setNewKybLevel("");
        },
        onError: () => toast.error("Failed to update status"),
      },
    );
  }

  function handleAssignRM(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRM) return;
    assignRM.mutate(
      { id, relationshipManagerId: selectedRM },
      {
        onSuccess: () => {
          toast.success("Relationship manager assigned");
          setSelectedRM("");
        },
        onError: () => toast.error("Failed to assign RM"),
      },
    );
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote.mutate(
      { id, content: noteText.trim() },
      {
        onSuccess: () => {
          toast.success("Note added");
          setNoteText("");
        },
        onError: () => toast.error("Failed to add note"),
      },
    );
  }

  const rmList = Array.isArray(rms) ? rms : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/businesses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">{business.name ?? "—"}</h2>
          <p className="text-sm text-muted-foreground">
            {business.market ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={business.isFrozen ? "frozen" : "active"} />
          <StatusBadge status={business.status ?? "unknown"} />
          <StatusBadge
            status={`level_${business.kybLevel ?? 0}`}
            className="bg-primary/10 text-primary"
          />
        </div>
      </div>

      {/* Business Details */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Business Details
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Business ID</p>
            <p className="text-sm font-medium break-all">{business.id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium">{business.status ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">KYB Level</p>
            <p className="text-sm font-medium">{business.kybLevel ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm font-medium">
              {business.createdAt
                ? new Date(business.createdAt).toLocaleDateString()
                : "—"}
            </p>
          </div>
          {business.relationshipManagerId && (
            <div>
              <p className="text-xs text-muted-foreground">
                Relationship Manager
              </p>
              <p className="text-sm font-medium">
                {rmList.find((rm) => rm.id === business.relationshipManagerId)
                  ?.fullName ?? business.relationshipManagerId}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {business.isFrozen ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnfreeze}
              disabled={unfreeze.isPending}
            >
              <Sun className="mr-1 h-3.5 w-3.5" /> Unfreeze
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleFreeze}
              disabled={freeze.isPending}
            >
              <Snowflake className="mr-1 h-3.5 w-3.5" /> Freeze
            </Button>
          )}
        </div>
      </div>

      {/* Update Status / KYB Level */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Update Status / KYB Level
        </h3>
        <form
          onSubmit={handleUpdateStatus}
          className="flex flex-wrap items-end gap-3"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Status</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              KYB Level (optional)
            </span>
            <Input
              type="number"
              min={0}
              max={3}
              value={newKybLevel}
              onChange={(e) => setNewKybLevel(e.target.value)}
              placeholder="0–3"
              className="w-20"
            />
          </label>
          <Button
            type="submit"
            size="sm"
            disabled={updateStatus.isPending || !newStatus}
          >
            Update
          </Button>
        </form>
      </div>

      {/* Assign RM */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Assign Relationship Manager
        </h3>
        <form onSubmit={handleAssignRM} className="flex items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Relationship Manager
            </span>
            <select
              value={selectedRM}
              onChange={(e) => setSelectedRM(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="">Select RM</option>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {rmList.map((rm: any) => (
                <option key={rm.id} value={rm.id}>
                  {rm.name ?? rm.fullName ?? rm.id}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="submit"
            size="sm"
            disabled={assignRM.isPending || !selectedRM}
          >
            <UserPlus className="mr-1 h-3.5 w-3.5" /> Assign
          </Button>
        </form>
      </div>

      {/* Add Note */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          Add Note
        </h3>
        <form onSubmit={handleAddNote} className="flex items-end gap-3">
          <Input
            placeholder="Enter note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={addNote.isPending || !noteText.trim()}
          >
            <StickyNote className="mr-1 h-3.5 w-3.5" /> Add Note
          </Button>
        </form>
      </div>
    </div>
  );
}
