"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileCheck,
  Download,
  Plus,
  Trash2,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useConfirmations,
  useRequestConfirmation,
  useRevokeConfirmation,
} from "@/hooks/use-confirmations";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  ready: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  revoked: "bg-muted text-muted-foreground border-border/60",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ConfirmationsPage() {
  const { data: confirmations, isLoading } = useConfirmations();
  const requestConfirmation = useRequestConfirmation();
  const revokeConfirmation = useRevokeConfirmation();

  const [showForm, setShowForm] = useState(false);
  const [currency, setCurrency] = useState("ETB");
  const [revoking, setRevoking] = useState<string | null>(null);

  async function handleRequest() {
    try {
      await requestConfirmation.mutateAsync();
      toast.success("Confirmation letter requested");
      setShowForm(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to request confirmation",
      );
    }
  }

  async function handleRevoke(id: string) {
    setRevoking(id);
    try {
      await revokeConfirmation.mutateAsync(id);
      toast.success("Confirmation revoked");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke confirmation",
      );
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Confirmation Letters"
        backHref="/"
        rightSlot={
          <Button
            size="sm"
            className="gap-1.5 rounded-xl"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" /> Request
          </Button>
        }
      />

      {/* Request form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 rounded-2xl border border-border/60 bg-card p-4"
        >
          <p className="text-sm font-semibold">Request Confirmation Letter</p>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Currency
            </label>
            <div className="flex gap-2">
              {["ETB", "USD", "GBP", "EUR"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    currency === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/60 bg-card text-muted-foreground hover:bg-primary/5"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleRequest}
              disabled={requestConfirmation.isPending}
            >
              {requestConfirmation.isPending ? "Requesting..." : "Request"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!confirmations || confirmations.length === 0) && (
        <EmptyState
          icon={FileCheck}
          title="No confirmation letters"
          description="Request a confirmation letter to verify your account balance."
          actionLabel="Request Letter"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* List */}
      {!isLoading && confirmations && confirmations.length > 0 && (
        <div className="space-y-3">
          {confirmations.map((conf, i) => (
            <motion.div
              key={conf.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Confirmation Letter</p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${STATUS_STYLES[conf.status] ?? ""}`}
                  >
                    {conf.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {formatDate(conf.createdAt)}
                  {conf.expiresAt && (
                    <> &middot; Expires {formatDate(conf.expiresAt)}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {conf.status === "ready" && conf.downloadUrl && (
                  <a
                    href={conf.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {conf.status === "ready" && (
                  <button
                    onClick={() => handleRevoke(conf.id)}
                    disabled={revoking === conf.id}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    {revoking === conf.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
                {conf.status === "pending" && (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
