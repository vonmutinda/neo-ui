"use client";

import { cn } from "@/lib/utils";
import {
  getInvoiceStatusColor,
  getInvoiceStatusLabel,
} from "@/lib/business-utils";
import type { InvoiceStatus } from "@/lib/business-types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        getInvoiceStatusColor(status),
      )}
    >
      {getInvoiceStatusLabel(status)}
    </span>
  );
}
