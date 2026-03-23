"use client";

import { cn } from "@/lib/utils";
import {
  getExportStatusColor,
  getExportStatusLabel,
} from "@/lib/business-utils";
import type { ExportStatus } from "@/lib/business-types";

interface ExportStatusBadgeProps {
  status: ExportStatus;
}

export function ExportStatusBadge({ status }: ExportStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getExportStatusColor(status),
      )}
    >
      {getExportStatusLabel(status)}
    </span>
  );
}
