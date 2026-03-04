"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Send,
  HandCoins,
  Trash2,
  Building2,
  ShieldCheck,
  User,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useRecipient,
  useToggleFavorite,
  useArchiveRecipient,
} from "@/hooks/use-recipients";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecipientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: recipient, isLoading, isError } = useRecipient(id);
  const toggleFav = useToggleFavorite();
  const archive = useArchiveRecipient();
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-48 rounded-3xl" />
        <div className="space-y-3">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !recipient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/recipients"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">Recipient</h1>
        </div>
        <div className="flex flex-col items-center gap-2 py-20">
          <p className="text-muted-foreground">Could not load recipient</p>
          <Link
            href="/recipients"
            className="text-sm font-medium text-primary"
          >
            Back to Recipients
          </Link>
        </div>
      </div>
    );
  }

  const isNeo = recipient.type === "neo_user";

  async function handleArchive() {
    try {
      await archive.mutateAsync(id);
      router.push("/recipients");
    } catch {
      /* toast handles error */
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/recipients"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">{recipient.displayName}</h1>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border bg-card"
      >
        <div className="flex flex-col items-center gap-5 p-8">
          {isNeo ? (
            <UserAvatar name={recipient.displayName} size="xl" className="h-20 w-20 text-2xl" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="text-center">
            <h2 className="text-lg font-bold">{recipient.displayName}</h2>
            <div className="mt-1 flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs ${
                  isNeo
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isNeo ? (
                  <User className="mr-1 h-3 w-3" />
                ) : (
                  <Building2 className="mr-1 h-3 w-3" />
                )}
                {isNeo ? "Neo User" : "Bank Account"}
              </Badge>
              {recipient.isBeneficiary && (
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20 text-xs"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Beneficiary
                </Badge>
              )}
            </div>
          </div>

          {/* Favorite toggle */}
          <button
            onClick={() =>
              toggleFav.mutate({
                id: recipient.id,
                isFavorite: !recipient.isFavorite,
              })
            }
            className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors active:bg-muted"
          >
            <Star
              className={`h-4 w-4 ${
                recipient.isFavorite
                  ? "fill-warning text-warning"
                  : "text-muted-foreground"
              }`}
            />
            {recipient.isFavorite ? "Favorited" : "Add to Favorites"}
          </button>
        </div>

        {/* Details */}
        <div className="space-y-0 border-t">
          {isNeo && recipient.username && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Username</span>
              <span className="text-sm font-medium">@{recipient.username}</span>
            </div>
          )}
          {isNeo && recipient.number && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">
                +{recipient.countryCode}{recipient.number}
              </span>
            </div>
          )}
          {!isNeo && recipient.bankName && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Bank</span>
              <span className="text-sm font-medium">{recipient.bankName}</span>
            </div>
          )}
          {!isNeo && recipient.accountNumberMasked && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">Account</span>
              <span className="text-sm font-medium font-tabular">
                {recipient.accountNumberMasked}
              </span>
            </div>
          )}
          {!isNeo && recipient.swiftBic && (
            <div className="flex items-center justify-between border-b px-6 py-3">
              <span className="text-xs text-muted-foreground">SWIFT/BIC</span>
              <span className="text-sm font-medium font-tabular">
                {recipient.swiftBic}
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-px border-t bg-border">
          <div className="flex flex-col items-center gap-0.5 bg-card py-3">
            <span className="text-xs text-muted-foreground">Transfers</span>
            <span className="text-sm font-semibold font-tabular">
              {recipient.transferCount}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 bg-card py-3">
            <span className="text-xs text-muted-foreground">Last Used</span>
            <span className="text-xs font-medium">
              {recipient.lastUsedAt
                ? formatDate(recipient.lastUsedAt)
                : "Never"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            href={
              isNeo
                ? `/send?phone=${encodeURIComponent(`+${recipient.countryCode ?? ""}${recipient.number ?? ""}`)}`
                : `/send?account=${encodeURIComponent(recipient.accountNumber ?? "")}&institution=${encodeURIComponent(recipient.institutionCode ?? "")}`
            }
          >
            <Button
              size="lg"
              className="h-14 w-full gap-2 text-base font-semibold"
            >
              <Send className="h-5 w-5" />
              Send Money
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link href="/requests/new">
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full gap-2 text-base font-semibold"
            >
              <HandCoins className="h-5 w-5" />
              Request Money
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            size="lg"
            variant="outline"
            onClick={() => setShowArchiveConfirm(true)}
            className="h-14 w-full gap-2 text-base font-semibold text-destructive hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
            Archive Recipient
          </Button>
        </motion.div>
      </div>

      {/* Archive confirmation sheet */}
      {showArchiveConfirm && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
            onClick={() => setShowArchiveConfirm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Archive Recipient</h3>
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-8 text-sm text-muted-foreground">
                Are you sure you want to archive{" "}
                <span className="font-medium text-foreground">
                  {recipient.displayName}
                </span>
                ? They&apos;ll be removed from your recipients list.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="h-14 flex-1 text-base"
                  onClick={() => setShowArchiveConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="h-14 flex-1 text-base"
                  disabled={archive.isPending}
                  onClick={handleArchive}
                >
                  {archive.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Archive"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
