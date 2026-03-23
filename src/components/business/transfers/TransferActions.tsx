"use client";

import { Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransferActionsProps {
  transferId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function TransferActions({
  transferId,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: TransferActionsProps) {
  const busy = isApproving || isRejecting;

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={() => onApprove(transferId)}
        disabled={busy}
        title="Approve"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-success/10 text-success-foreground",
          "transition-all hover:bg-success hover:text-white",
          "active:scale-90 disabled:opacity-50 disabled:pointer-events-none",
        )}
      >
        {isApproving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </button>
      <button
        onClick={() => onReject(transferId)}
        disabled={busy}
        title="Reject"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          "bg-destructive/8 text-destructive",
          "transition-all hover:bg-destructive hover:text-white",
          "active:scale-90 disabled:opacity-50 disabled:pointer-events-none",
        )}
      >
        {isRejecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
