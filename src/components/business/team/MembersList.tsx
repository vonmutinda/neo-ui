"use client";

import { Users } from "lucide-react";
import { MemberCard } from "@/components/business/team/MemberCard";
import type { BusinessMember, BusinessRole } from "@/lib/business-types";

interface MembersListProps {
  members: BusinessMember[];
  roles: BusinessRole[];
  canManage: boolean;
  ownerId: string;
  onRoleChange: (memberId: string, roleId: string) => void;
  onRemove: (memberId: string) => void;
}

export function MembersList({
  members,
  roles,
  canManage,
  ownerId,
  onRoleChange,
  onRemove,
}: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No team members</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Invite your first team member to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          roles={roles}
          canManage={canManage}
          isOwner={member.userId === ownerId}
          onRoleChange={onRoleChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
