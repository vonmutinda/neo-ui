"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PERMISSION_GROUPS, getPermissionLabel } from "@/lib/business-utils";
import type {
  BusinessPermission,
  CreateRoleRequest,
} from "@/lib/business-types";

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateRoleRequest) => void;
  isPending?: boolean;
}

export function CreateRoleDialog({
  open,
  onClose,
  onSubmit,
  isPending,
}: CreateRoleDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Set<BusinessPermission>>(
    new Set(),
  );

  function togglePermission(perm: BusinessPermission) {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  }

  function toggleGroup(groupPerms: BusinessPermission[]) {
    setPermissions((prev) => {
      const next = new Set(prev);
      const allSelected = groupPerms.every((p) => next.has(p));
      if (allSelected) {
        groupPerms.forEach((p) => next.delete(p));
      } else {
        groupPerms.forEach((p) => next.add(p));
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || permissions.size === 0) return;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      permissions: Array.from(permissions),
    });
  }

  function handleClose() {
    setName("");
    setDescription("");
    setPermissions(new Set());
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />
      {/* Dialog */}
      <div
        className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-role-title"
      >
        <h2
          id="create-role-title"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Create Custom Role
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Define permissions for this role.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {/* Role name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Role Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Accountant"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Description{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <textarea
              placeholder="What does this role do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 hover:bg-muted focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Permission groups */}
          <div>
            <p className="mb-3 text-xs font-medium text-foreground/70">
              Permissions
            </p>
            <div className="flex flex-col gap-4">
              {PERMISSION_GROUPS.map((group) => {
                const allSelected = group.permissions.every((p) =>
                  permissions.has(p),
                );
                const someSelected =
                  !allSelected &&
                  group.permissions.some((p) => permissions.has(p));

                return (
                  <div key={group.label}>
                    {/* Group header with toggle-all */}
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.permissions)}
                      className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-tight text-foreground/70 transition-colors hover:text-foreground"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                          allSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : someSelected
                              ? "border-primary/50 bg-primary/10"
                              : "border-muted-foreground/30",
                        )}
                      >
                        {allSelected && "\u2713"}
                        {someSelected && "\u2013"}
                      </span>
                      {group.label}
                    </button>

                    {/* Individual permissions */}
                    <div className="ml-6 flex flex-col gap-1.5">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex cursor-pointer items-center gap-2 text-xs text-foreground/70 transition-colors hover:text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={permissions.has(perm)}
                            onChange={() => togglePermission(perm)}
                            className="h-3.5 w-3.5 rounded border-muted-foreground/30 text-primary accent-primary"
                          />
                          {getPermissionLabel(perm)}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || permissions.size === 0 || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
