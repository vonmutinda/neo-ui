"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { BusinessMember, BusinessRole } from "@/lib/business-types";

const AVATAR_COLORS = [
  "bg-primary",
  "bg-success",
  "bg-warning",
  "bg-destructive",
  "bg-secondary",
];

function getAvatarColor(userId: string) {
  const code = userId.charCodeAt(0) % 5;
  return AVATAR_COLORS[code];
}

function getInitials(userId: string) {
  return userId.slice(0, 2).toUpperCase();
}

interface MemberCardProps {
  member: BusinessMember;
  roles: BusinessRole[];
  canManage: boolean;
  isOwner: boolean;
  onRoleChange: (memberId: string, roleId: string) => void;
  onRemove: (memberId: string) => void;
}

export function MemberCard({
  member,
  roles,
  canManage,
  isOwner,
  onRoleChange,
  onRemove,
}: MemberCardProps) {
  const displayName = member.title || member.role?.name || "Member";
  const initials = getInitials(member.userId);
  const avatarColor = getAvatarColor(member.userId);
  const truncatedId =
    member.userId.length > 12
      ? `${member.userId.slice(0, 6)}...${member.userId.slice(-4)}`
      : member.userId;

  const joinedDate = new Date(member.joinedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-background p-4 transition-all",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        "hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
          avatarColor,
        )}
      >
        {initials}
      </div>

      {/* Name & ID */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
          {isOwner && (
            <Badge variant="secondary" className="text-[10px]">
              Owner
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{truncatedId}</p>
      </div>

      {/* Role dropdown + metadata */}
      <div className="hidden flex-col items-end gap-1 sm:flex">
        {canManage && !isOwner ? (
          <select
            value={member.roleId}
            onChange={(e) => onRoleChange(member.id, e.target.value)}
            className="rounded-lg bg-muted/50 px-2 py-1 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {member.role?.name ?? "---"}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground/60">
          Joined {joinedDate}
        </span>
      </div>

      {/* Status pill */}
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          member.isActive
            ? "bg-success/10 text-success-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {member.isActive ? "Active" : "Removed"}
      </span>

      {/* Remove button */}
      {canManage && !isOwner && member.isActive && (
        <button
          onClick={() => onRemove(member.id)}
          className="shrink-0 text-xs font-medium text-destructive transition-colors hover:text-destructive/80"
        >
          Remove
        </button>
      )}
    </div>
  );
}
