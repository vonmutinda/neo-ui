"use client";

import { use } from "react";
import { useAdminCustomer, useAdminCustomerFlags } from "@/hooks/admin/use-admin-customers";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, Wallet, CreditCard, Landmark, Flag, ArrowLeft, ShieldCheck, PiggyBank } from "lucide-react";
import Link from "next/link";
import { formatMoney } from "@/lib/format";

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

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: profile, isLoading } = useAdminCustomer(id);
  const { data: flags } = useAdminCustomerFlags(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return <p className="py-12 text-center text-muted-foreground">Customer not found</p>;
  }

  const user = profile.user ?? {} as Record<string, unknown>;
  const balances = profile.currencyBalances ?? [];
  const transactions = profile.recentTransactions ?? [];
  const kycVerifications = profile.kycVerifications ?? [];
  const pots = profile.pots ?? [];
  const internalNotes = profile.internalNotes ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-xl font-semibold">
            {user.firstName ?? ""} {user.middleName ?? ""} {user.lastName ?? ""}
          </h2>
          <p className="text-sm text-muted-foreground">{user.phoneNumber ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={user.isFrozen ? "frozen" : "active"} />
          <StatusBadge status={`level_${user.kycLevel ?? 0}`} className="bg-primary/10 text-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Balance" value={profile.totalDisplay || "—"} icon={Wallet} />
        <StatsCard label="Active Loans" value={profile.activeLoans} icon={Landmark} />
        <StatsCard label="Active Cards" value={profile.activeCards} icon={CreditCard} />
        <StatsCard label="Open Flags" value={flags?.length ?? 0} icon={Flag} />
      </div>

      {balances.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Currency Balances</h3>
          <div className="space-y-2">
            {balances.map((bal) => (
              <div key={bal.currencyCode} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{bal.currencyCode}</span>
                  {bal.isPrimary && <StatusBadge status="active" className="text-[10px]" />}
                </div>
                <div className="text-right">
                  <span className="font-tabular text-sm font-semibold">{bal.display}</span>
                  {bal.accountDetails && (
                    <p className="text-xs text-muted-foreground">
                      {bal.accountDetails.bankName} &middot; {bal.accountDetails.accountNumber}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.creditProfile && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Credit Profile</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Trust Score</p>
              <p className="font-tabular text-lg font-semibold">{profile.creditProfile.trustScore}</p>
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
                {formatMoney(profile.creditProfile.currentOutstandingCents, "ETB")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NBE Blacklisted</p>
              <p className="text-lg font-semibold">{profile.creditProfile.isNbeBlacklisted ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      )}

      {kycVerifications.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">KYC Verifications</h3>
          <div className="space-y-2">
            {kycVerifications.map((kyc) => (
              <div key={kyc.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fayda ID: {kyc.faydaFin}</p>
                    {kyc.verifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Verified: {new Date(kyc.verifiedAt).toLocaleDateString()}
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
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Savings Pots</h3>
          <div className="space-y-2">
            {pots.map((pot) => (
              <div key={pot.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{pot.emoji ?? ""} {pot.name}</p>
                    <p className="text-xs text-muted-foreground">{pot.currencyCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-tabular text-sm font-semibold">
                    {formatMoney(pot.balanceCents, pot.currencyCode)}
                  </p>
                  {pot.targetCents != null && pot.targetCents > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {pot.progressPercent ?? Math.round((pot.balanceCents / pot.targetCents) * 100)}% of target
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
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Recent Transactions</h3>
          <div className="space-y-1">
            {transactions.slice(0, 10).map((tx) => (
              <Link
                key={tx.id}
                href={`/admin/transactions/${tx.id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted"
              >
                <div>
                  <p className="text-sm font-medium">{TYPE_LABELS[tx.type] ?? tx.type?.replace(/_/g, " ") ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{tx.counterpartyName || tx.narration || "—"}</p>
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
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Internal Notes</h3>
          <div className="space-y-2">
            {internalNotes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border px-3 py-2">
                <p className="text-sm">{note.metadata?.note as string ?? note.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString()} &middot; {note.actorId}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
