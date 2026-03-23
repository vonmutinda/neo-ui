"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  HandCoins,
  Trash2,
  ShieldCheck,
  User,
  Baby,
  Heart,
  Loader2,
  Star,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { BankLogo } from "@/components/shared/BankLogos";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecipient,
  useMakeRecipientBeneficiary,
  useArchiveRecipient,
  useToggleFavorite,
} from "@/hooks/use-recipients";
import type { BeneficiaryRelationship } from "@/lib/types";

const RELATIONSHIP_OPTIONS: {
  value: BeneficiaryRelationship;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "spouse", label: "Spouse", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "child", label: "Child", icon: <Baby className="h-3.5 w-3.5" /> },
  { value: "parent", label: "Parent", icon: <User className="h-3.5 w-3.5" /> },
];

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecipientDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: recipient, isLoading, isError, refetch } = useRecipient(id);
  const toggleFav = useToggleFavorite();
  const makeBeneficiary = useMakeRecipientBeneficiary();
  const archive = useArchiveRecipient();
  const [showBeneficiary, setShowBeneficiary] = useState(false);
  const [beneficiaryRelationship, setBeneficiaryRelationship] =
    useState<BeneficiaryRelationship>("child");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Recipient" backHref="/recipients" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !recipient) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Recipient" backHref="/recipients" />
        <p className="text-center text-sm text-muted-foreground">
          Could not load recipient
        </p>
      </div>
    );
  }

  const isEnviar = recipient.type === "enviar_user";

  async function handleArchive() {
    try {
      await archive.mutateAsync(id);
      router.push("/recipients");
    } catch {
      /* toast */
    }
  }

  const details: { label: string; value: string; mono?: boolean }[] = [];
  if (isEnviar && recipient.username)
    details.push({ label: "Username", value: `@${recipient.username}` });
  if (isEnviar && recipient.number)
    details.push({
      label: "Phone",
      value: `+${recipient.countryCode}${recipient.number}`,
    });
  if (!isEnviar && recipient.bankName)
    details.push({ label: "Bank", value: recipient.bankName });
  if (!isEnviar && recipient.accountNumberMasked)
    details.push({
      label: "Account",
      value: recipient.accountNumberMasked,
      mono: true,
    });
  if (!isEnviar && recipient.swiftBic)
    details.push({
      label: "SWIFT/BIC",
      value: recipient.swiftBic,
      mono: true,
    });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Recipient" backHref="/recipients" />

      <motion.div
        key={id}
        {...fadeSlide}
        className="rounded-2xl border border-border/60 bg-card shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)]"
      >
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
          {isEnviar ? (
            <UserAvatar
              name={recipient.displayName}
              size="xl"
              className="h-[72px] w-[72px] text-2xl"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-muted">
              <BankLogo
                institutionId={recipient.institutionCode ?? ""}
                className="h-14 w-14"
              />
            </div>
          )}

          <div className="text-center">
            <h2 className="text-lg font-bold text-foreground">
              {recipient.displayName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="outline" className="text-[11px] font-medium">
                {isEnviar ? "Enviar User" : (recipient.bankName ?? "Bank")}
              </Badge>
              {recipient.isBeneficiary && (
                <Badge
                  variant="outline"
                  className="border-success/30 bg-success/10 text-success text-[11px] font-medium"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Beneficiary
                </Badge>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toggleFav.mutate({
                id: recipient.id,
                isFavorite: !recipient.isFavorite,
              })
            }
            className={`mt-1 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              recipient.isFavorite
                ? "bg-warning/10 text-warning"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Star
              className={`h-3.5 w-3.5 ${recipient.isFavorite ? "fill-warning" : ""}`}
            />
            {recipient.isFavorite ? "Favorited" : "Add to favorites"}
          </button>
        </div>

        <div className="mx-6 border-t border-border/60" />

        <div className="p-6 space-y-4">
          {details.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/60">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="text-xs text-muted-foreground">
                    {d.label}
                  </span>
                  <span
                    className={`text-sm font-medium text-foreground ${d.mono ? "font-mono" : ""}`}
                  >
                    {d.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Transfers
              </p>
              <p className="mt-1 font-tabular text-lg font-semibold text-foreground">
                {recipient.transferCount}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Last used
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {recipient.lastUsedAt
                  ? formatDate(recipient.lastUsedAt)
                  : "Never"}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <Link
              href={
                isEnviar
                  ? `/send?phone=${encodeURIComponent(`+${recipient.countryCode ?? ""}${recipient.number ?? ""}`)}`
                  : `/send?account=${encodeURIComponent(recipient.accountNumber ?? "")}&institution=${encodeURIComponent(recipient.institutionCode ?? "")}`
              }
              className="flex-1"
            >
              <Button className="h-11 w-full gap-2 rounded-xl text-sm font-semibold">
                <Send className="h-4 w-4" />
                Send Money
              </Button>
            </Link>
            <Link href="/requests/new" className="flex-1">
              <Button
                variant="outline"
                className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
              >
                <HandCoins className="h-4 w-4" />
                Request Money
              </Button>
            </Link>
          </div>

          {!recipient.isBeneficiary && !showBeneficiary && (
            <button
              type="button"
              onClick={() => setShowBeneficiary(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/5 py-2.5 text-sm font-medium text-success hover:bg-success/10 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              Make beneficiary
            </button>
          )}

          <AnimatePresence>
            {showBeneficiary && (
              <motion.div
                key="beneficiary-form"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 rounded-xl border border-success/20 bg-success/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-success/80">
                    Relationship
                  </p>
                  <div className="flex gap-2">
                    {RELATIONSHIP_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setBeneficiaryRelationship(r.value)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-colors ${
                          beneficiaryRelationship === r.value
                            ? "border-success bg-success/10 text-success"
                            : "border-border/60 text-foreground/70 hover:border-success/40"
                        }`}
                      >
                        {r.icon}
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBeneficiary(false)}
                      className="flex-1 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={makeBeneficiary.isPending}
                      onClick={async () => {
                        await makeBeneficiary.mutateAsync({
                          recipientId: id,
                          relationship: beneficiaryRelationship,
                        });
                        setShowBeneficiary(false);
                        refetch();
                      }}
                      className="flex-1 rounded-xl bg-success text-success-foreground hover:bg-success/90"
                    >
                      {makeBeneficiary.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showArchiveConfirm ? (
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-destructive/70 hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Archive Recipient
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4"
            >
              <p className="text-sm text-foreground/80">
                Archive{" "}
                <span className="font-semibold">{recipient.displayName}</span>?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchiveConfirm(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={archive.isPending}
                  onClick={handleArchive}
                  className="flex-1 rounded-xl"
                >
                  {archive.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Archive"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
