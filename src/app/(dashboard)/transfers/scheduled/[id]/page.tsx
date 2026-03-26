"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Calendar,
  User,
  Pause,
  Play,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useScheduledTransfer,
  usePauseScheduledTransfer,
  useResumeScheduledTransfer,
  useCancelScheduledTransfer,
} from "@/hooks/use-scheduled-transfers";
import { toast } from "sonner";
import { formatMoney } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-muted text-muted-foreground border-border/60",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ScheduledTransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: transfer, isLoading } = useScheduledTransfer(id);
  const pauseTransfer = usePauseScheduledTransfer();
  const resumeTransfer = useResumeScheduledTransfer();
  const cancelTransfer = useCancelScheduledTransfer();

  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Scheduled Transfer"
          backHref="/transfers/scheduled"
        />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pt-20">
        <p className="text-muted-foreground">Transfer not found</p>
        <Link
          href="/transfers/scheduled"
          className="text-sm font-medium text-primary"
        >
          Back to scheduled transfers
        </Link>
      </div>
    );
  }

  async function handlePause() {
    try {
      await pauseTransfer.mutateAsync(id);
      toast.success("Transfer paused");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to pause transfer",
      );
    }
  }

  async function handleResume() {
    try {
      await resumeTransfer.mutateAsync(id);
      toast.success("Transfer resumed");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resume transfer",
      );
    }
  }

  async function handleCancel() {
    try {
      await cancelTransfer.mutateAsync(id);
      toast.success("Transfer cancelled");
      router.push("/transfers/scheduled");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel transfer",
      );
    }
  }

  const isActive = transfer.status === "active";
  const isPaused = transfer.status === "paused";
  const canManage = isActive || isPaused;

  return (
    <div className="space-y-6">
      <PageHeader title="Scheduled Transfer" backHref="/transfers/scheduled" />

      {/* Status + Amount card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs ${STATUS_STYLES[transfer.status] ?? ""}`}
          >
            {transfer.status}
          </Badge>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-4 text-3xl font-bold tabular-nums">
          {formatMoney(transfer.amountCents, transfer.currency)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {transfer.frequency}
        </p>
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="space-y-0.5 overflow-hidden rounded-2xl border border-border/60 bg-card"
      >
        <DetailRow
          icon={<User className="h-4 w-4" />}
          label="Recipient"
          value={transfer.recipient}
        />
        <DetailRow
          icon={<Calendar className="h-4 w-4" />}
          label="Next Run"
          value={transfer.nextRunAt ? formatDate(transfer.nextRunAt) : "N/A"}
        />
        {transfer.narration && (
          <DetailRow
            icon={<ArrowRight className="h-4 w-4" />}
            label="Narration"
            value={transfer.narration}
          />
        )}
        {transfer.maxRuns != null && (
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Max Runs"
            value={`${transfer.runCount ?? 0} / ${transfer.maxRuns}`}
          />
        )}
        {transfer.createdAt && (
          <DetailRow
            icon={<Calendar className="h-4 w-4" />}
            label="Created"
            value={formatDate(transfer.createdAt)}
          />
        )}
      </motion.div>

      {/* Actions */}
      {canManage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3"
        >
          {isActive ? (
            <Button
              variant="outline"
              size="lg"
              className="h-12 flex-1 gap-2 rounded-xl border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/10"
              onClick={handlePause}
              disabled={pauseTransfer.isPending}
            >
              <Pause className="h-4 w-4" />
              {pauseTransfer.isPending ? "Pausing..." : "Pause"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="h-12 flex-1 gap-2 rounded-xl border-success/30 text-success hover:bg-success/10"
              onClick={handleResume}
              disabled={resumeTransfer.isPending}
            >
              <Play className="h-4 w-4" />
              {resumeTransfer.isPending ? "Resuming..." : "Resume"}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="h-12 flex-1 gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmCancel(true)}
          >
            <XCircle className="h-4 w-4" /> Cancel
          </Button>
        </motion.div>
      )}

      {/* Cancel confirmation */}
      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
          >
            <p className="text-sm font-medium">
              Cancel this scheduled transfer?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This action cannot be undone. No further transfers will be made.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmCancel(false)}
                className="flex-1"
              >
                Keep
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelTransfer.isPending}
                className="flex-1"
              >
                {cancelTransfer.isPending ? "Cancelling..." : "Cancel Transfer"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
