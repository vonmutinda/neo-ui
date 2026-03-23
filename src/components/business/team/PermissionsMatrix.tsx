"use client";

import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";
import { PERMISSION_GROUPS, getPermissionLabel } from "@/lib/business-utils";
import type { BusinessRole } from "@/lib/business-types";

interface PermissionsMatrixProps {
  roles: BusinessRole[];
}

export function PermissionsMatrix({ roles }: PermissionsMatrixProps) {
  if (roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-foreground">No roles defined</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first custom role to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl bg-background",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Permission
            </th>
            {roles.map((role) => (
              <th
                key={role.id}
                className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60"
              >
                <span className="inline-flex items-center gap-1">
                  {role.name}
                  {role.isSystem && (
                    <span className="text-[9px] font-normal normal-case text-muted-foreground/40">
                      (system)
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_GROUPS.map((group) => (
            <>
              {/* Group header */}
              <tr key={`group-${group.label}`}>
                <td
                  colSpan={roles.length + 1}
                  className="bg-muted/30 px-4 py-2 text-xs font-semibold tracking-tight text-foreground/70"
                >
                  {group.label}
                </td>
              </tr>
              {/* Permission rows */}
              {group.permissions.map((perm) => (
                <tr key={perm} className="transition-colors hover:bg-muted/20">
                  <td className="sticky left-0 bg-background px-4 py-2.5 text-xs text-foreground/80">
                    {getPermissionLabel(perm)}
                  </td>
                  {roles.map((role) => {
                    const has = role.permissions.includes(perm);
                    return (
                      <td key={role.id} className="px-4 py-2.5 text-center">
                        {has ? (
                          <Check className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          <Minus className="mx-auto h-3.5 w-3.5 text-muted-foreground/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
