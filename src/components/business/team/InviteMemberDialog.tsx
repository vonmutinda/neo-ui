"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BusinessRole, InviteMemberRequest } from "@/lib/business-types";

function formatPhoneDisplay(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  roles: BusinessRole[];
  onInvite: (req: InviteMemberRequest) => void;
  isPending?: boolean;
}

export function InviteMemberDialog({
  open,
  onClose,
  roles,
  onInvite,
  isPending,
}: InviteMemberDialogProps) {
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id ?? "");
  const [title, setTitle] = useState("");

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 9));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !roleId) return;
    onInvite({
      phoneNumber: `+251${phone}`,
      roleId,
      title: title.trim() || undefined,
    });
  }

  function handleClose() {
    setPhone("");
    setRoleId(roles[0]?.id ?? "");
    setTitle("");
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Invite Team Member
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Send an invitation to join your business.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {/* Phone number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="flex h-10 items-center rounded-lg bg-muted/50 px-3 text-sm font-medium text-muted-foreground">
                +251
              </span>
              <Input
                type="tel"
                placeholder="912 345 678"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Role
            </label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="h-10 w-full rounded-lg bg-muted/50 px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted"
              required
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground/70">
              Title{" "}
              <span className="font-normal text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Finance Manager"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
              disabled={!phone || phone.length < 9 || !roleId || isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
