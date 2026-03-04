"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Star,
  ChevronRight,
  Building2,
  User,
  Users,
  Heart,
  Baby,
  ShieldCheck,
  Clock,
  Trash2,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { UserAvatar } from "@/components/shared/UserAvatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useRecipients,
  useToggleFavorite,
  useCreateRecipient,
  useBanks,
} from "@/hooks/use-recipients";
import { useResolveRecipient } from "@/hooks/use-resolve-recipient";
import {
  useBeneficiaries,
  useCreateBeneficiary,
  useDeleteBeneficiary,
} from "@/hooks/use-beneficiaries";
import type {
  Recipient,
  RecipientType,
  Beneficiary,
  BeneficiaryRelationship,
} from "@/lib/types";

type Tab = "recipients" | "beneficiaries";
type FilterChip = "all" | "neo_user" | "bank_account" | "favorites";

const FILTER_CHIPS: { key: FilterChip; label: string }[] = [
  { key: "all", label: "All" },
  { key: "neo_user", label: "Neo Users" },
  { key: "bank_account", label: "Bank Accounts" },
  { key: "favorites", label: "Favorites" },
];

const RELATIONSHIP_CONFIG: Record<
  BeneficiaryRelationship,
  { label: string; icon: React.ReactNode; color: string }
> = {
  spouse: {
    label: "Spouse",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-pink-500/10 text-pink-500",
  },
  child: {
    label: "Child",
    icon: <Baby className="h-4 w-4" />,
    color: "bg-blue-500/10 text-blue-500",
  },
  parent: {
    label: "Parent",
    icon: <User className="h-4 w-4" />,
    color: "bg-amber-500/10 text-amber-500",
  },
};

function RecipientRow({ recipient }: { recipient: Recipient }) {
  const toggleFav = useToggleFavorite();
  const isNeo = recipient.type === "neo_user";

  return (
    <div className="flex items-center gap-3">
      <Link href={`/recipients/${recipient.id}`} className="flex flex-1 items-center gap-3">
        {isNeo ? (
          <UserAvatar name={recipient.displayName} />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">
              {recipient.displayName}
            </span>
            {recipient.isBeneficiary && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {isNeo
              ? recipient.username
                ? `@${recipient.username}`
                : recipient.number
                  ? `+${recipient.countryCode}${recipient.number}`
                  : "Neo user"
              : recipient.accountNumberMasked
                ? `${recipient.bankName} · ${recipient.accountNumberMasked}`
                : recipient.bankName ?? "Bank account"}
          </p>
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleFav.mutate({
            id: recipient.id,
            isFavorite: !recipient.isFavorite,
          });
        }}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors active:bg-muted"
      >
        <Star
          className={`h-4 w-4 ${
            recipient.isFavorite
              ? "fill-warning text-warning"
              : "text-muted-foreground"
          }`}
        />
      </button>

      <Link href={`/recipients/${recipient.id}`}>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}

function BeneficiaryRow({ beneficiary }: { beneficiary: Beneficiary }) {
  const deleteBen = useDeleteBeneficiary();
  const [confirming, setConfirming] = useState(false);
  const rel = RELATIONSHIP_CONFIG[beneficiary.relationship];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${rel.color}`}
      >
        {rel.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">
            {beneficiary.fullName}
          </span>
          {beneficiary.isVerified ? (
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
          ) : (
            <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {rel.label}
          {beneficiary.isVerified ? " · Verified" : " · Pending verification"}
        </p>
      </div>

      {confirming ? (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="destructive"
            className="h-7 px-2 text-xs"
            disabled={deleteBen.isPending}
            onClick={() => deleteBen.mutate(beneficiary.id)}
          >
            {deleteBen.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Remove"
            )}
          </Button>
          <button
            onClick={() => setConfirming(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-muted"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function AddBeneficiarySheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateBeneficiary();
  const [name, setName] = useState("");
  const [relationship, setRelationship] =
    useState<BeneficiaryRelationship>("spouse");
  const [docUrl, setDocUrl] = useState("");

  const nameValid = name.trim().length >= 2 && name.trim().length <= 200;
  const formValid = nameValid;

  async function handleSubmit() {
    if (!formValid) return;
    try {
      await create.mutateAsync({
        fullName: name.trim(),
        relationship,
        documentUrl: docUrl.trim() || undefined,
      });
      setName("");
      setDocUrl("");
      setRelationship("spouse");
      onClose();
    } catch {
      /* toast handles error */
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Add Beneficiary</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                placeholder="e.g. Almaz Kebede"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-base"
                autoFocus
              />
              {name.length > 0 && !nameValid && (
                <p className="mt-1 text-xs text-destructive">
                  Name must be 2–200 characters
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Relationship
              </label>
              <div className="flex gap-2">
                {(
                  ["spouse", "child", "parent"] as BeneficiaryRelationship[]
                ).map((r) => {
                  const cfg = RELATIONSHIP_CONFIG[r];
                  return (
                    <button
                      key={r}
                      onClick={() => setRelationship(r)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                        relationship === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "bg-card text-muted-foreground"
                      }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Document URL (optional)
              </label>
              <Input
                placeholder="https://..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="h-14 text-base"
              />
            </div>

            <Button
              size="lg"
              disabled={!formValid || create.isPending}
              onClick={handleSubmit}
              className="mt-6 h-14 w-full text-base font-semibold"
            >
              {create.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Add Beneficiary"
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

type RecipientMode = "neo_user" | "bank_account";

function AddRecipientSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateRecipient();
  const resolve = useResolveRecipient();
  const banks = useBanks();

  const [mode, setMode] = useState<RecipientMode>("neo_user");
  const [identifier, setIdentifier] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  const resolved = resolve.data;
  const resolvedName = resolved
    ? [resolved.firstName, resolved.lastName].filter(Boolean).join(" ")
    : "";
  const resolvedPhone =
    resolved
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

  const neoValid = !!resolved;
  const bankValid = institutionCode.length > 0 && accountNumber.length >= 4;
  const formValid = mode === "neo_user" ? neoValid : bankValid;

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
      if (mode === "neo_user") {
        await create.mutateAsync({
          type: "neo_user",
          identifier: resolvedPhone,
        });
      } else {
        await create.mutateAsync({
          type: "bank_account",
          institutionCode,
          accountNumber,
        });
      }
      resetForm();
      onClose();
    } catch {
      /* toast handles error */
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-t-3xl border bg-card p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Add Recipient</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode pills */}
          <div className="mb-6 flex gap-2">
            {(["neo_user", "bank_account"] as RecipientMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  resetForm();
                }}
                className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {m === "neo_user" ? "Neo User" : "Bank Account"}
              </button>
            ))}
          </div>

          {mode === "neo_user" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Phone or Username
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
                      if (e.key === "Enter" && identifier.trim().length >= 2) {
                        resolve.mutate(identifier.trim());
                      }
                    }}
                    className="h-14 pr-10 text-base"
                    autoFocus
                  />
                  {resolve.isPending && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                {resolve.isError && (
                  <p className="mt-1 text-xs text-destructive">
                    {resolve.error.message || "User not found"}
                  </p>
                )}
              </div>

              {resolved && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border-2 border-green-500 bg-green-500/5 p-3.5"
                >
                  <p className="text-sm font-semibold">{resolvedName}</p>
                  <p className="text-xs text-muted-foreground">
                    {resolvedPhone}
                    {resolved.username && ` · @${resolved.username}`}
                  </p>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Bank
                </label>
                <Input
                  placeholder="Search banks..."
                  value={bankDropdownOpen ? bankSearch : selectedBankName ?? bankSearch}
                  onChange={(e) => {
                    setBankSearch(e.target.value);
                    setBankDropdownOpen(true);
                    if (institutionCode) setInstitutionCode("");
                  }}
                  onFocus={() => setBankDropdownOpen(true)}
                  className="h-14 text-base"
                />
                {bankDropdownOpen && filteredBanks.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border bg-card shadow-lg">
                    {filteredBanks.map((b) => (
                      <button
                        key={b.institutionCode}
                        type="button"
                        onClick={() => {
                          setInstitutionCode(b.institutionCode);
                          setBankSearch(b.name);
                          setBankDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted ${
                          institutionCode === b.institutionCode ? "bg-primary/5 font-semibold text-primary" : ""
                        }`}
                      >
                        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
                {bankDropdownOpen && filteredBanks.length === 0 && bankSearch && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">
                    No banks match &ldquo;{bankSearch}&rdquo;
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                  Account Number
                </label>
                <Input
                  placeholder="e.g. 100012345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-14 text-base"
                />
                {accountNumber.length > 0 && accountNumber.length < 4 && (
                  <p className="mt-1 text-xs text-destructive">
                    At least 4 characters
                  </p>
                )}
              </div>
            </div>
          )}

          <Button
            size="lg"
            disabled={!formValid || create.isPending}
            onClick={handleSubmit}
            className="mt-8 h-14 w-full text-base font-semibold"
          >
            {create.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Add Recipient"
            )}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function RecipientsPage() {
  const [tab, setTab] = useState<Tab>("recipients");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterChip>("all");
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showAddRecipient, setShowAddRecipient] = useState(false);

  const recipientParams = useMemo(() => {
    const p: { q?: string; type?: RecipientType; favorite?: boolean } = {};
    if (search.trim()) p.q = search.trim();
    if (filter === "neo_user" || filter === "bank_account") p.type = filter;
    if (filter === "favorites") p.favorite = true;
    return p;
  }, [search, filter]);

  const recipients = useRecipients(recipientParams);
  const beneficiaries = useBeneficiaries();

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-semibold">People</h1>
        </div>
        {tab === "recipients" && (
          <Button
            size="sm"
            onClick={() => setShowAddRecipient(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
        {tab === "beneficiaries" && (
          <Button
            size="sm"
            onClick={() => setShowAddBeneficiary(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setTab("recipients")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "recipients"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Recipients
        </button>
        <button
          onClick={() => setTab("beneficiaries")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${
            tab === "beneficiaries"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Beneficiaries
        </button>
      </div>

      {/* Recipients tab */}
      {tab === "recipients" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search recipients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-10"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  filter === chip.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* List */}
          {recipients.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipients.isError ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <p className="text-sm text-muted-foreground">
                Could not load recipients
              </p>
              <button
                onClick={() => recipients.refetch()}
                className="text-sm font-medium text-primary"
              >
                Try again
              </button>
            </div>
          ) : recipients.data &&
            recipients.data.recipients.length > 0 ? (
            <div className="space-y-1">
              {recipients.data.recipients.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4 transition-colors"
                >
                  <RecipientRow recipient={r} />
                </motion.div>
              ))}
              {recipients.data.total > recipients.data.recipients.length && (
                <p className="pt-2 text-center text-xs text-muted-foreground">
                  Showing {recipients.data.recipients.length} of{" "}
                  {recipients.data.total}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? "No recipients match your search"
                  : "No recipients yet"}
              </p>
              {!search.trim() && (
                <p className="text-xs text-muted-foreground">
                  They&apos;ll appear here after your first transfer
                </p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Beneficiaries tab */}
      {tab === "beneficiaries" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {beneficiaries.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : beneficiaries.isError ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <p className="text-sm text-muted-foreground">
                Could not load beneficiaries
              </p>
              <button
                onClick={() => beneficiaries.refetch()}
                className="text-sm font-medium text-primary"
              >
                Try again
              </button>
            </div>
          ) : beneficiaries.data && beneficiaries.data.length > 0 ? (
            <div className="space-y-1">
              {beneficiaries.data.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="rounded-2xl bg-muted dark:bg-card dark:border dark:border-border p-4"
                >
                  <BeneficiaryRow beneficiary={b} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-muted dark:bg-card dark:border dark:border-border py-12">
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No beneficiaries added
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Add family members for international transfers
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddBeneficiary(true)}
                className="mt-1 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Beneficiary
              </Button>
            </div>
          )}
        </motion.div>
      )}

      <AddRecipientSheet
        open={showAddRecipient}
        onClose={() => setShowAddRecipient(false)}
      />
      <AddBeneficiarySheet
        open={showAddBeneficiary}
        onClose={() => setShowAddBeneficiary(false)}
      />
    </div>
  );
}
