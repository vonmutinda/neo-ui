"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Canonical page header — consistent back button + title across all pages.
 *
 * - backHref:  omit for top-level tabs (Dashboard, Cards, Loans)
 * - rightSlot: optional trailing element (link, badge, etc.)
 */
export function PageHeader({
  title,
  backHref,
  rightSlot,
}: {
  title: string;
  backHref?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {backHref && (
        <Link
          href={backHref}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted active:bg-muted"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
      <h1 className="flex-1 text-xl font-semibold text-foreground">{title}</h1>
      {rightSlot}
    </div>
  );
}
