"use client";

import { cn } from "@/lib/utils";
import {
  getImportStatusColor,
  getImportStatusLabel,
} from "@/lib/business-utils";
import type { ImportStatus } from "@/lib/business-types";

interface ImportStatusBadgeProps {
  status: ImportStatus;
}

export function ImportStatusBadge({ status }: ImportStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getImportStatusColor(status),
      )}
    >
      {getImportStatusLabel(status)}
    </span>
  );
}
