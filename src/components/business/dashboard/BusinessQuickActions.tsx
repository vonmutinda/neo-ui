"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Layers, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    href: "/business/transfers/new",
    label: "Send Money",
    icon: ArrowUpRight,
    iconBg: "bg-[oklch(0.93_0.04_300)] text-[oklch(0.55_0.15_300)]",
    perm: (p: string[]) =>
      p.includes("biz:transfers:initiate:internal") ||
      p.includes("biz:transfers:initiate:external"),
  },
  {
    href: "/business/invoices/new",
    label: "Invoice",
    icon: FileText,
    iconBg: "bg-warning/10 text-warning-foreground",
    perm: (p: string[]) => p.includes("biz:invoices:manage"),
  },
  {
    href: "/business/payments/new",
    label: "Batch Pay",
    icon: Layers,
    iconBg: "bg-primary/10 text-primary",
    perm: (p: string[]) => p.includes("biz:batch:create"),
  },
  {
    href: "/business/convert",
    label: "Convert",
    icon: ArrowLeftRight,
    iconBg: "bg-success/10 text-success-foreground",
    perm: (p: string[]) => p.includes("biz:convert:initiate"),
  },
] as const;

export function BusinessQuickActions({
  permissions,
}: {
  permissions?: string[];
}) {
  const visible = permissions
    ? ACTIONS.filter((a) => a.perm(permissions))
    : [...ACTIONS];

  return (
    <div className="mb-10 flex flex-wrap gap-3">
      {visible.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex items-center gap-2.5 rounded-full bg-background px-5 py-3",
              "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
              "text-sm font-medium transition-all duration-200",
              "hover:shadow-[0_4px_16px_oklch(0.40_0.06_70/6%),0_1px_4px_oklch(0.40_0.06_70/4%)] hover:-translate-y-px",
              "active:scale-[0.97]",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                action.iconBg,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}
