"use client";

import { use, useState } from "react";
import {
  useAdminCustomer,
  useAdminCustomerFlags,
  useAdminDepositToCustomer,
} from "@/hooks/admin/use-admin-customers";
import { useAdminOverrideCredit } from "@/hooks/admin/use-admin-loans";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  CreditCard,
  Landmark,
  Flag,
  ArrowLeft,
  ShieldCheck,
  PiggyBank,
  Plus,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = {
  p2p_send: "P2P Send",
  p2p_receive: "P2P Receive",
  ethswitch_out: "Bank Transfer Out",
  ethswitch_in: "Bank Transfer In",
  card_purchase: "Card Purchase",
  card_atm: "ATM Withdrawal",
  loan_disbursement: "Loan Disbursement",
  loan_repayment: "Loan Repayment",
  fee: "Fee",
  convert_out: "FX Conversion",
  convert_in: "FX Conversion (In)",
};

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: profile, isLoading } = useAdminCustomer(id);
  const { data: flags } = useAdminCustomerFlags(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Customer not found
      </p>
    );
  }

  const user = profile.user ?? ({} as Record<string, unknown>);
  const balances = profile.currencyBalances ?? [];
  const transactions = profile.recentTransactions ?? [];
  const kycVerifications = profile.kycVerifications ?? [];
  const pots = profile.pots ?? [];
  const internalNotes = profile.internalNotes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">
            {user.firstName ?? ""} {user.middleName ?? ""} {user.lastName ?? ""}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.phoneNumber ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={user.isFrozen ? "frozen" : "active"} />
          <StatusBadge
            status={`level_${user.kycLevel ?? 0}`}
            className="bg-primary/10 text-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Balance"
          value={profile.totalDisplay || "—"}
          icon={Wallet}
        />
        <StatsCard
          label="Active Loans"
          value={profile.activeLoans}
          icon={Landmark}
        />
        <StatsCard
          label="Active Cards"
          value={profile.activeCards}
          icon={CreditCard}
        />
        <StatsCard label="Open Flags" value={flags?.length ?? 0} icon={Flag} />
      </div>

      {balances.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Currency Balances
            </h3>
            <DepositButton userId={id} />
          </div>
          <div className="space-y-2">
            {balances.map((bal) => (
              <div
                key={bal.currencyCode}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {bal.currencyCode}
                  </span>
                  {bal.isPrimary && (
                    <StatusBadge status="active" className="text-[10px]" />
                  )}
                </div>
                <div className="text-right">
                  <span className="font-tabular text-sm font-semibold">
                    {bal.display}
                  </span>
                  {bal.accountDetails && (
                    <p className="text-xs text-muted-foreground">
                      {bal.accountDetails.bankName} &middot;{" "}
                      {bal.accountDetails.accountNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Credit Profile
          </h3>
          <CreditOverrideButtons userId={id} />
        </div>
        {profile.creditProfile ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <p className="font-tabular text-lg font-semibold">
                {profile.creditProfile.trustScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved Limit</p>
              <p className="font-tabular text-lg font-semibold">
                {formatMoney(profile.creditProfile.approvedLimitCents, "ETB")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="font-tabular text-lg font-semibold">
                {formatMoney(
                  profile.creditProfile.currentOutstandingCents,
                  "ETB",
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NBE Blacklisted</p>
              <p className="text-lg font-semibold">
                {profile.creditProfile.isNbeBlacklisted ? "Yes" : "No"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No credit profile yet. Use &quot;Upgrade for testing&quot; to create
            one.
          </p>
        )}
      </div>

      {kycVerifications.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            KYC Verifications
          </h3>
          <div className="space-y-2">
            {kycVerifications.map((kyc) => (
              <div
                key={kyc.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Fayda ID: {kyc.faydaFin}
                    </p>
                    {kyc.verifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Verified:{" "}
                        {new Date(kyc.verifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={kyc.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {pots.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Savings Pots
          </h3>
          <div className="space-y-2">
            {pots.map((pot) => (
              <div
                key={pot.id}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {pot.emoji ?? ""} {pot.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pot.currencyCode}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-tabular text-sm font-semibold">
                    {formatMoney(pot.balanceCents, pot.currencyCode)}
                  </p>
                  {pot.targetCents != null && pot.targetCents > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {pot.progressPercent ??
                        Math.round((pot.balanceCents / pot.targetCents) * 100)}
                      % of target
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Recent Transactions
          </h3>
          <div className="space-y-1">
            {transactions.slice(0, 10).map((tx) => (
              <Link
                key={tx.id}
                href={`/admin/transactions/${tx.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium">
                    {TYPE_LABELS[tx.type] ?? tx.type?.replace(/_/g, " ") ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.counterpartyName || tx.narration || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-tabular text-sm font-semibold">
                    {formatMoney(tx.amountCents ?? 0, tx.currency ?? "ETB")}
                  </p>
                  <StatusBadge status={tx.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {internalNotes.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Internal Notes
          </h3>
          <div className="space-y-2">
            {internalNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border px-3 py-2"
              >
                <p className="text-sm">
                  {(note.metadata?.note as string) ?? note.action}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()} &middot;{" "}
                  {note.actorId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const DEFAULT_TEST_TRUST_SCORE = 750;
const DEFAULT_TEST_LIMIT_ETB = 50_000; // 50k ETB in birr; sent as cents (5_000_000)

function CreditOverrideButtons({ userId }: { userId: string }) {
  const [showCustom, setShowCustom] = useState(false);
  const [trustScore, setTrustScore] = useState(DEFAULT_TEST_TRUST_SCORE);
  const [limitEtb, setLimitEtb] = useState(DEFAULT_TEST_LIMIT_ETB);
  const [reason, setReason] = useState("Testing upgrade");
  const override = useAdminOverrideCredit();

  function handleOneClick() {
    override.mutate(
      {
        userId,
        trustScore: DEFAULT_TEST_TRUST_SCORE,
        approvedLimitCents: DEFAULT_TEST_LIMIT_ETB * 100,
        reason: "Testing upgrade",
      },
      {
        onSuccess: () => toast.success("Credit profile updated for testing"),
        onError: () => toast.error("Override failed"),
      },
    );
  }

  function handleCustomSubmit(e: React.FormEvent) {
    e.preventDefault();
    const score = Math.min(1000, Math.max(1, trustScore));
    const limitCents = Math.round(limitEtb * 100);
    if (limitCents <= 0 || !reason.trim()) {
      toast.error("Enter valid limit (ETB) and reason");
      return;
    }
    override.mutate(
      {
        userId,
        trustScore: score,
        approvedLimitCents: limitCents,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Credit profile updated");
          setShowCustom(false);
        },
        onError: () => toast.error("Override failed"),
      },
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleOneClick}
          disabled={override.isPending}
        >
          <TrendingUp className="mr-1 h-3.5 w-3.5" /> Upgrade for testing
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCustom((v) => !v)}
          className="text-muted-foreground"
        >
          {showCustom ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Custom
        </Button>
      </div>
      {showCustom && (
        <form
          onSubmit={handleCustomSubmit}
          className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-muted/30 p-3"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Trust score (1–1000)
            </span>
            <Input
              type="number"
              min={1}
              max={1000}
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value) || 750)}
              className="w-24"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Limit (ETB)</span>
            <Input
              type="number"
              min={1}
              value={limitEtb}
              onChange={(e) => setLimitEtb(Number(e.target.value) || 0)}
              className="w-28"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Reason</span>
            <Input
              type="text"
              placeholder="Required"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-40"
            />
          </label>
          <Button type="submit" size="sm" disabled={override.isPending}>
            Apply
          </Button>
        </form>
      )}
    </div>
  );
}

function DepositButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const deposit = useAdminDepositToCustomer();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    deposit.mutate(
      {
        id: userId,
        amountCents: Math.round(parsed * 100),
        narration: narration.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Deposited ${parsed.toFixed(2)} ETB`);
          setAmount("");
          setNarration("");
          setOpen(false);
        },
        onError: () => toast.error("Deposit failed"),
      },
    );
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Deposit Funds
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount (ETB)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-32"
        autoFocus
      />
      <Input
        type="text"
        placeholder="Narration (optional)"
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
        className="w-44"
      />
      <Button type="submit" size="sm" disabled={deposit.isPending}>
        {deposit.isPending ? "..." : "Send"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>
    </form>
  );
}
