"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowLeftRight, FileText, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BusinessPermission } from "@/lib/business-types";

interface WalletsQuickActionsProps {
  onAddCurrency: () => void;
  permissions: BusinessPermission[];
}

export function WalletsQuickActions({
  onAddCurrency,
  permissions,
}: WalletsQuickActionsProps) {
  const canSend =
    permissions.includes("biz:transfers:initiate:internal") ||
    permissions.includes("biz:transfers:initiate:external");
  const canConvert = permissions.includes("biz:convert:initiate");
  const canManageWallets = permissions.includes("biz:wallets:manage");
  const canExport = permissions.includes("biz:transactions:export");

  const buttonBase = cn(
    "flex flex-col items-center gap-2 rounded-2xl bg-background p-5",
    "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
    "text-sm font-medium transition-all duration-200",
    "hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
    "active:scale-[0.97]",
  );

  const disabledBase = cn(
    "flex flex-col items-center gap-2 rounded-2xl bg-background p-5",
    "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
    "text-sm font-medium opacity-40 cursor-not-allowed",
  );

  return (
    <div className="mb-10 grid grid-cols-4 gap-3">
      {canSend ? (
        <Link href="/business/transfers/new" className={buttonBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.93_0.04_300)] text-[oklch(0.55_0.15_300)]">
            <ArrowUpRight className="h-5 w-5" />
          </span>
          <span>Send</span>
        </Link>
      ) : (
        <div className={disabledBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowUpRight className="h-5 w-5" />
          </span>
          <span>Send</span>
        </div>
      )}

      {canConvert ? (
        <Link href="/business/convert" className={buttonBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span>Convert</span>
        </Link>
      ) : (
        <div className={disabledBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeftRight className="h-5 w-5" />
          </span>
          <span>Convert</span>
        </div>
      )}

      {canExport ? (
        <Link href="/business/accounting" className={buttonBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning-foreground">
            <FileText className="h-5 w-5" />
          </span>
          <span>Statement</span>
        </Link>
      ) : (
        <div className={disabledBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FileText className="h-5 w-5" />
          </span>
          <span>Statement</span>
        </div>
      )}

      {canManageWallets ? (
        <button type="button" onClick={onAddCurrency} className={buttonBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success-foreground">
            <Plus className="h-5 w-5" />
          </span>
          <span>Add Currency</span>
        </button>
      ) : (
        <div className={disabledBase}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Plus className="h-5 w-5" />
          </span>
          <span>Add Currency</span>
        </div>
      )}
    </div>
  );
}
