"use client";

import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { MembersList } from "@/components/business/team/MembersList";
import { PermissionsMatrix } from "@/components/business/team/PermissionsMatrix";
import { InviteMemberDialog } from "@/components/business/team/InviteMemberDialog";
import { CreateRoleDialog } from "@/components/business/team/CreateRoleDialog";
import { TeamSkeleton } from "@/components/business/team/TeamSkeleton";
import { useBusinessStore } from "@/providers/business-store";
import {
  useBusinessMembers,
  useMyPermissions,
} from "@/hooks/business/use-business-members";
import {
  useBusinessRoles,
  useCreateRole,
} from "@/hooks/business/use-business-roles";
import {
  useInviteMember,
  useUpdateMember,
  useRemoveMember,
} from "@/hooks/business/use-manage-members";

type Tab = "members" | "permissions";

export default function TeamPage() {
  const { activeBusinessId, activeBusiness } = useBusinessStore();
  const bizId = activeBusinessId;

  const { data: members, isLoading: membersLoading } =
    useBusinessMembers(bizId);
  const { data: roles, isLoading: rolesLoading } = useBusinessRoles(bizId);
  const { data: myPermissions } = useMyPermissions(bizId);

  const inviteMutation = useInviteMember(bizId);
  const updateMemberMutation = useUpdateMember(bizId);
  const removeMemberMutation = useRemoveMember(bizId);
  const createRoleMutation = useCreateRole(bizId);

  const [tab, setTab] = useState<Tab>("members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);

  const canManageMembers =
    myPermissions?.includes("biz:members:manage") ?? false;
  const canManageRoles = myPermissions?.includes("biz:roles:manage") ?? false;
  const ownerId = activeBusiness?.ownerUserId ?? "";

  const isLoading = membersLoading || rolesLoading;

  if (isLoading) {
    return <TeamSkeleton />;
  }

  const memberList = members ?? [];
  const roleList = roles ?? [];
  const activeMembers = memberList.filter((m) => m.isActive);

  function handleRoleChange(memberId: string, roleId: string) {
    updateMemberMutation.mutate(
      { memberId, body: { roleId } },
      {
        onSuccess: () => toast.success("Role updated"),
        onError: () => toast.error("Failed to update role"),
      },
    );
  }

  function handleRemove(memberId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?",
    );
    if (!confirmed) return;

    removeMemberMutation.mutate(memberId, {
      onSuccess: () => toast.success("Member removed"),
      onError: () => toast.error("Failed to remove member"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Team"
        rightSlot={
          canManageMembers ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Invite
            </Button>
          ) : undefined
        }
      />

      {/* Segmented tabs */}
      <div className="flex items-center gap-1 rounded-full bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setTab("members")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            tab === "members"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Members ({activeMembers.length})
        </button>
        <button
          onClick={() => setTab("permissions")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
            tab === "permissions"
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Permissions
        </button>
      </div>

      {/* Tab content */}
      {tab === "members" && (
        <MembersList
          members={memberList}
          roles={roleList}
          canManage={canManageMembers}
          ownerId={ownerId}
          onRoleChange={handleRoleChange}
          onRemove={handleRemove}
        />
      )}

      {tab === "permissions" && (
        <div className="flex flex-col gap-4">
          {canManageRoles && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateRoleOpen(true)}
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                New Role
              </Button>
            </div>
          )}
          <PermissionsMatrix roles={roleList} />
        </div>
      )}

      {/* Invite dialog */}
      <InviteMemberDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roles={roleList}
        onInvite={(req) => {
          inviteMutation.mutate(req, {
            onSuccess: () => {
              toast.success("Invitation sent");
              setInviteOpen(false);
            },
            onError: () => toast.error("Failed to send invitation"),
          });
        }}
        isPending={inviteMutation.isPending}
      />

      {/* Create role dialog */}
      <CreateRoleDialog
        open={createRoleOpen}
        onClose={() => setCreateRoleOpen(false)}
        onSubmit={(req) => {
          createRoleMutation.mutate(req, {
            onSuccess: () => {
              toast.success("Role created");
              setCreateRoleOpen(false);
            },
            onError: () => toast.error("Failed to create role"),
          });
        }}
        isPending={createRoleMutation.isPending}
      />
    </div>
  );
}
