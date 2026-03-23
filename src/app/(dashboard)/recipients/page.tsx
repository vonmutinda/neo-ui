"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Star,
  Building2,
  ShieldCheck,
  Plus,
  Send,
  HandCoins,
  Trash2,
  User,
  Loader2,
  Heart,
  Baby,
  Users,
  X,
  ChevronRight,
  Phone,
  ArrowUpRight,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { BankLogo } from "@/components/shared/BankLogos";
import { EmptyState } from "@/components/shared/EmptyState";
import { SuccessAnimation } from "@/components/shared/SuccessAnimation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useRecipients,
  useRecipient,
  useToggleFavorite,
  useCreateRecipient,
  useMakeRecipientBeneficiary,
  useArchiveRecipient,
  useBanks,
} from "@/hooks/use-recipients";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import { useCreateBeneficiary } from "@/hooks/use-beneficiaries";
import type {
  Recipient,
  RecipientType,
  BeneficiaryRelationship,
} from "@/lib/types";

/* ─── Constants ─── */

type FilterChip = "all" | "enviar_user" | "bank_account" | "favorites";

const FILTER_CHIPS: { key: FilterChip; label: string }[] = [
  { key: "all", label: "All" },
  { key: "enviar_user", label: "Enviar Users" },
  { key: "bank_account", label: "Bank" },
  { key: "favorites", label: "Favorites" },
];

const RELATIONSHIP_OPTIONS: {
  value: BeneficiaryRelationship;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "spouse", label: "Spouse", icon: <Heart className="h-3.5 w-3.5" /> },
  { value: "child", label: "Child", icon: <Baby className="h-3.5 w-3.5" /> },
  { value: "parent", label: "Parent", icon: <User className="h-3.5 w-3.5" /> },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: "easeOut" as const },
};

/* ─── Recipient Row ─── */

function RecipientRow({
  recipient,
  isSelected,
  isExpanded,
  onSelect,
}: {
  recipient: Recipient;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
}) {
  const toggleFav = useToggleFavorite();
  const isEnviar = recipient.type === "enviar_user";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={`group flex w-full cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left transition-all active:scale-[0.99] ${
          isSelected ? "bg-primary/8" : "hover:bg-muted/60"
        }`}
      >
        {isEnviar ? (
          <UserAvatar name={recipient.displayName} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <BankLogo
              institutionId={recipient.institutionCode ?? ""}
              className="h-8 w-8"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {recipient.displayName}
            </span>
            {recipient.isBeneficiary && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {isEnviar
              ? recipient.username
                ? `@${recipient.username}`
                : recipient.number
                  ? `+${recipient.countryCode}${recipient.number}`
                  : "Enviar user"
              : recipient.accountNumberMasked
                ? `${recipient.bankName} · ${recipient.accountNumberMasked}`
                : (recipient.bankName ?? "Bank account")}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFav.mutate({
              id: recipient.id,
              isFavorite: !recipient.isFavorite,
            });
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-95"
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              recipient.isFavorite
                ? "fill-warning text-warning"
                : "text-foreground/20 group-hover:text-foreground/40"
            }`}
          />
        </button>

        <ChevronRight
          className={`h-4 w-4 shrink-0 text-foreground/20 transition-transform lg:hidden ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </div>

      {/* Mobile: inline expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden lg:hidden"
          >
            <div className="border-t border-border/60 bg-muted/30 px-4 py-4">
              <RecipientDetailInline recipientId={recipient.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Recipient Detail (shared between inline mobile and desktop panel) ─── */

function RecipientDetailInline({ recipientId }: { recipientId: string }) {
  const { data: recipient, isLoading, refetch } = useRecipient(recipientId);
  const makeBeneficiary = useMakeRecipientBeneficiary();
  const archive = useArchiveRecipient();
  const [showBeneficiary, setShowBeneficiary] = useState(false);
  const [beneficiaryRelationship, setBeneficiaryRelationship] =
    useState<BeneficiaryRelationship>("child");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  if (isLoading || !recipient) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  const isEnviar = recipient.type === "enviar_user";

  async function handleArchive() {
    try {
      await archive.mutateAsync(recipientId);
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
    <div className="space-y-4">
      {/* Info rows */}
      {details.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card divide-y divide-border/60">
          {details.map((d) => (
            <div
              key={d.label}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-xs text-muted-foreground">{d.label}</span>
              <span
                className={`text-sm font-medium text-foreground ${
                  d.mono ? "font-mono" : ""
                }`}
              >
                {d.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
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
            {recipient.lastUsedAt ? formatDate(recipient.lastUsedAt) : "Never"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
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
            Send
          </Button>
        </Link>
        <Link href="/requests/new" className="flex-1">
          <Button
            variant="outline"
            className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
          >
            <HandCoins className="h-4 w-4" />
            Request
          </Button>
        </Link>
      </div>

      {/* Beneficiary */}
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
                      recipientId,
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

      {/* Archive */}
      {!showArchiveConfirm ? (
        <button
          type="button"
          onClick={() => setShowArchiveConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium text-destructive/70 hover:bg-destructive/5 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Archive person
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
  );
}

/* ─── Detail Panel (desktop right column) ─── */

function DetailPanel({ recipientId }: { recipientId: string }) {
  const { data: recipient, isLoading } = useRecipient(recipientId);
  const toggleFav = useToggleFavorite();

  if (isLoading || !recipient) {
    return (
      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)]">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-28 rounded-xl" />
        <div className="flex gap-2.5">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  const isEnviar = recipient.type === "enviar_user";

  return (
    <motion.div
      key={recipientId}
      {...fadeSlide}
      className="rounded-2xl border border-border/60 bg-card shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)]"
    >
      {/* Profile header */}
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
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <Badge variant="outline" className="text-[11px] font-medium">
              {isEnviar ? (
                <User className="mr-1 h-3 w-3" />
              ) : (
                <BankLogo
                  institutionId={recipient.institutionCode ?? ""}
                  className="mr-1 h-3 w-3"
                />
              )}
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
            className={`h-3.5 w-3.5 ${
              recipient.isFavorite ? "fill-warning" : ""
            }`}
          />
          {recipient.isFavorite ? "Favorited" : "Add to favorites"}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-border/60" />

      {/* Detail + actions */}
      <div className="p-6">
        <RecipientDetailInline recipientId={recipientId} />
      </div>
    </motion.div>
  );
}

/* ─── Add Recipient Form ─── */

type RecipientMode = "enviar_user" | "bank_account";

function AddRecipientForm({ onDone }: { onDone: () => void }) {
  const create = useCreateRecipient();
  const resolve = useResolveRecipient();
  const banks = useBanks();
  const createBeneficiary = useCreateBeneficiary();

  const [mode, setMode] = useState<RecipientMode>("enviar_user");
  const [identifier, setIdentifier] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  const [isBeneficiary, setIsBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [relationship, setRelationship] =
    useState<BeneficiaryRelationship>("spouse");
  const [docUrl, setDocUrl] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const resolved = resolve.data;
  const resolvedName = resolved
    ? [resolved.firstName, resolved.lastName].filter(Boolean).join(" ")
    : "";
  const resolvedPhone = resolved
    ? typeof resolved.phoneNumber === "string"
      ? resolved.phoneNumber
      : `${resolved.phoneNumber.countryCode}${resolved.phoneNumber.number}`
    : "";

  const filteredBanks = (banks.data ?? []).filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase()),
  );
  const selectedBankName = banks.data?.find(
    (b) => b.institutionCode === institutionCode,
  )?.name;

  const enviarValid = !!resolved;
  const bankValid = institutionCode.length > 0 && accountNumber.length >= 4;
  const recipientValid = mode === "enviar_user" ? enviarValid : bankValid;
  const beneficiaryValid = !isBeneficiary || beneficiaryName.trim().length >= 2;
  const formValid = recipientValid && beneficiaryValid;
  const isSubmitting = create.isPending || createBeneficiary.isPending;

  function resetForm() {
    setIdentifier("");
    setInstitutionCode("");
    setAccountNumber("");
    setBankSearch("");
    setBankDropdownOpen(false);
    resolve.reset();
  }

  async function handleSubmit() {
    if (!formValid) return;
    try {
      if (mode === "enviar_user") {
        await create.mutateAsync({
          type: "enviar_user",
          identifier: resolvedPhone,
        });
      } else {
        await create.mutateAsync({
          type: "bank_account",
          institutionCode,
          accountNumber,
        });
      }

      if (isBeneficiary && beneficiaryName.trim()) {
        await createBeneficiary.mutateAsync({
          fullName: beneficiaryName.trim(),
          relationship,
          documentUrl: docUrl.trim() || undefined,
        });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onDone();
      }, 1500);
    } catch {
      /* toast */
    }
  }

  return (
    <>
      <SuccessAnimation
        show={showSuccess}
        title="Person added"
        subtitle={resolvedName || selectedBankName || "Added successfully"}
      />

      <motion.div
        {...fadeSlide}
        className="rounded-2xl border border-border/60 bg-card shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)]"
      >
        {/* Form header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-foreground">
            Add person
          </h2>
          <button
            type="button"
            onClick={onDone}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Mode pills */}
          <div className="grid grid-cols-2 gap-2">
            {(["enviar_user", "bank_account"] as RecipientMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  resetForm();
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {m === "enviar_user" ? (
                  <Phone className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
                {m === "enviar_user" ? "Enviar User" : "Bank Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "enviar_user" && (
              <motion.div key="enviar" {...fadeSlide} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Phone or username
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. 0912345678 or @username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (resolve.data) resolve.reset();
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          identifier.trim().length >= 2
                        ) {
                          resolve.mutate(identifier.trim());
                        }
                      }}
                      className="pr-10"
                      autoFocus
                    />
                    {resolve.isPending && (
                      <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {!resolve.isPending &&
                    identifier.trim().length >= 2 &&
                    !resolved && (
                      <button
                        type="button"
                        onClick={() => resolve.mutate(identifier.trim())}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Search className="h-3 w-3" />
                        Look up
                      </button>
                    )}
                  {resolve.isError && (
                    <p className="mt-1.5 text-xs text-destructive">
                      User not found
                    </p>
                  )}
                </div>

                {resolved && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5"
                  >
                    <UserAvatar
                      name={resolvedName}
                      className="h-9 w-9 text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {resolvedName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {resolvedPhone}
                        {resolved.username && ` · @${resolved.username}`}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-primary/60" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {mode === "bank_account" && (
              <motion.div key="bank" {...fadeSlide} className="space-y-4">
                <div className="relative">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Bank
                  </label>
                  <Input
                    placeholder="Search banks..."
                    value={
                      bankDropdownOpen
                        ? bankSearch
                        : (selectedBankName ?? bankSearch)
                    }
                    onChange={(e) => {
                      setBankSearch(e.target.value);
                      setBankDropdownOpen(true);
                      if (institutionCode) setInstitutionCode("");
                    }}
                    onFocus={() => setBankDropdownOpen(true)}
                  />
                  {bankDropdownOpen && filteredBanks.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-lg">
                      {filteredBanks.map((b) => (
                        <button
                          key={b.institutionCode}
                          type="button"
                          onClick={() => {
                            setInstitutionCode(b.institutionCode);
                            setBankSearch(b.name);
                            setBankDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/60 ${
                            institutionCode === b.institutionCode
                              ? "bg-primary/5 font-semibold text-primary"
                              : "text-foreground"
                          }`}
                        >
                          <BankLogo
                            institutionId={b.institutionCode}
                            className="h-5 w-5 shrink-0"
                          />
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Account number
                  </label>
                  <Input
                    placeholder="e.g. 100012345678"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beneficiary toggle */}
          <div className="rounded-xl border border-border/60 p-4">
            <button
              type="button"
              onClick={() => setIsBeneficiary(!isBeneficiary)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10">
                  <ShieldCheck className="h-4 w-4 text-success" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">
                    Add as beneficiary
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    For international transfers
                  </p>
                </div>
              </div>
              <div
                className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                  isBeneficiary ? "bg-primary" : "bg-foreground/15"
                }`}
                role="switch"
                aria-checked={isBeneficiary}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    isBeneficiary ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {isBeneficiary && (
                <motion.div
                  key="beneficiary-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Full name
                      </label>
                      <Input
                        placeholder="e.g. Almaz Kebede"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Relationship
                      </label>
                      <div className="flex gap-2">
                        {RELATIONSHIP_OPTIONS.map((r) => (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => setRelationship(r.value)}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-all active:scale-[0.97] ${
                              relationship === r.value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/60 text-muted-foreground hover:border-primary/40"
                            }`}
                          >
                            {r.icon}
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Document URL (optional)
                      </label>
                      <Input
                        placeholder="https://..."
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            disabled={!formValid || isSubmitting}
            onClick={handleSubmit}
            className="h-12 w-full rounded-xl text-sm font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add person"
            )}
          </Button>
        </div>
      </motion.div>
    </>
  );
}

/* ─── Main Page ─── */

type RightPanel = { kind: "detail"; id: string } | { kind: "add" } | null;

export default function RecipientsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const recipientParams = useMemo(() => {
    const p: { q?: string; type?: RecipientType; favorite?: boolean } = {};
    if (search.trim()) p.q = search.trim();
    if (filter === "enviar_user" || filter === "bank_account") p.type = filter;
    if (filter === "favorites") p.favorite = true;
    return p;
  }, [search, filter]);

  const recipients = useRecipients(recipientParams);
  const list = recipients.data?.recipients ?? [];
  const total = recipients.data?.total ?? 0;

  const handleSelectRecipient = useCallback((id: string) => {
    setRightPanel({ kind: "detail", id });
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleShowAdd = useCallback(() => {
    setRightPanel({ kind: "add" });
    setExpandedId(null);
  }, []);

  const handleAddDone = useCallback(() => {
    setRightPanel(null);
  }, []);

  return (
    <div className="pb-20">
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Left column */}
        <div className="space-y-5 lg:col-start-1">
          {/* Header row */}
          <PageHeader
            title="People"
            backHref="/"
            rightSlot={
              <Button
                onClick={handleShowAdd}
                variant={rightPanel?.kind === "add" ? "default" : "outline"}
                className="gap-1.5 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            }
          />
          {!recipients.isLoading && total > 0 && (
            <p className="-mt-3 text-xs text-muted-foreground">
              {total} {total === 1 ? "person" : "people"}
            </p>
          )}

          {/* Mobile: add form at top */}
          <div className="lg:hidden">
            <AnimatePresence>
              {rightPanel?.kind === "add" && (
                <motion.div
                  key="mobile-add"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mb-4">
                    <AddRecipientForm onDone={handleAddDone} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all active:scale-95 ${
                  filter === chip.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* List card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_1px_3px_oklch(0.40_0.06_70/6%),0_8px_24px_oklch(0.40_0.06_70/8%)]">
              {recipients.isLoading ? (
                <div className="divide-y divide-border/60">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3.5 px-4 py-3.5"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recipients.isError ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    Couldn&apos;t load people
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => recipients.refetch()}
                    className="rounded-xl"
                  >
                    Try again
                  </Button>
                </div>
              ) : list.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {list.map((r) => (
                    <RecipientRow
                      key={r.id}
                      recipient={r}
                      isSelected={
                        rightPanel?.kind === "detail" && rightPanel.id === r.id
                      }
                      isExpanded={expandedId === r.id}
                      onSelect={() => handleSelectRecipient(r.id)}
                    />
                  ))}
                  {total > list.length && (
                    <p className="px-4 py-3 text-center text-xs text-muted-foreground">
                      Showing {list.length} of {total}
                    </p>
                  )}
                </div>
              ) : (
                <div className="px-4 py-8">
                  <EmptyState
                    icon={Users}
                    title={
                      search.trim() ? "No matching people" : "No people yet"
                    }
                    description={
                      search.trim()
                        ? undefined
                        : "Add people to send and receive money easily."
                    }
                    actionLabel={search.trim() ? undefined : "Add person"}
                    onAction={search.trim() ? undefined : handleShowAdd}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right column: detail or add form (desktop only) */}
        <div className="hidden lg:block lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {rightPanel?.kind === "detail" && (
              <motion.div key={`detail-${rightPanel.id}`} {...fadeSlide}>
                <DetailPanel recipientId={rightPanel.id} />
              </motion.div>
            )}

            {rightPanel?.kind === "add" && (
              <motion.div key="add-form" {...fadeSlide}>
                <AddRecipientForm onDone={handleAddDone} />
              </motion.div>
            )}

            {!rightPanel && (
              <motion.div key="empty" {...fadeSlide}>
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/70">
                      Select a person
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Click someone from the list to view their details
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
