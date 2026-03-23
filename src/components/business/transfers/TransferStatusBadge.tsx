"use client";

import { cn } from "@/lib/utils";
import {
  getTransferStatusColor,
  getTransferStatusLabel,
} from "@/lib/business-utils";
import type { BusinessTransferStatus } from "@/lib/business-types";

interface TransferStatusBadgeProps {
  status: BusinessTransferStatus;
}

export function TransferStatusBadge({ status }: TransferStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getTransferStatusColor(status),
      )}
    >
      {getTransferStatusLabel(status)}
    </span>
  );
}
