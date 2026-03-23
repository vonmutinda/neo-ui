"use client";

import { useState } from "react";
import { useAdminConfig } from "@/hooks/admin/use-admin-config";
import { useAdminFXRates } from "@/hooks/admin/use-admin-fx-rates";
import { useAdminFeeSchedules } from "@/hooks/admin/use-admin-fees";
import {
  useAdminSystemAccounts,
  useAdminTopUpCapital,
} from "@/hooks/admin/use-admin-system-accounts";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: configData, isLoading: configLoading } = useAdminConfig();
  const { data: fxData, isLoading: fxLoading } = useAdminFXRates();
  const { data: feesData, isLoading: feesLoading } = useAdminFeeSchedules();
  const { data: systemData, isLoading: systemLoading } =
    useAdminSystemAccounts();
  const topUp = useAdminTopUpCapital();

  const config = configData ?? [];
  const fxRates = fxData ?? [];
  const feeSchedules = feesData ?? [];
  const pools = systemData?.pools ?? [];

  return (
    <div className="space-y-8">
      {/* Capital Pools */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Capital Pools</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {systemLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))
            : pools.map((pool) => (
                <CapitalPoolCard
                  key={pool.account}
                  pool={pool}
                  onTopUp={(amountCents) => {
                    const poolKey = pool.account.includes("loan_capital")
                      ? "loan_capital"
                      : "overdraft_capital";
                    topUp.mutate(
                      {
                        pool: poolKey as "loan_capital" | "overdraft_capital",
                        amountCents,
                      },
                      {
                        onSuccess: () =>
                          toast.success(`Topped up ${pool.label}`),
                        onError: () =>
                          toast.error(`Failed to top up ${pool.label}`),
                      },
                    );
                  }}
                  isLoading={topUp.isPending}
                />
              ))}
        </div>
      </section>

      {/* System Config */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">System Config</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {configLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : config.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">
              No config entries
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {config.map((entry) => (
                  <tr
                    key={entry.key}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{entry.key}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeof entry.value === "object"
                        ? JSON.stringify(entry.value)
                        : String(entry.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* FX Rates */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">FX Rates</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {fxLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : fxRates.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">
              No FX rates
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">From</th>
                  <th className="px-4 py-3 font-semibold">To</th>
                  <th className="px-4 py-3 font-semibold">Mid</th>
                  <th className="px-4 py-3 font-semibold">Bid</th>
                  <th className="px-4 py-3 font-semibold">Ask</th>
                  <th className="px-4 py-3 font-semibold">Spread</th>
                </tr>
              </thead>
              <tbody>
                {fxRates.map((rate) => (
                  <tr
                    key={rate.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">{rate.fromCurrency}</td>
                    <td className="px-4 py-3">{rate.toCurrency}</td>
                    <td className="px-4 py-3">{rate.midRate}</td>
                    <td className="px-4 py-3">{rate.bidRate}</td>
                    <td className="px-4 py-3">{rate.askRate}</td>
                    <td className="px-4 py-3">{rate.spreadPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Fee Schedules */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Fee Schedules</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {feesLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : feeSchedules.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">
              No fee schedules
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Currency</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {feeSchedules.map((fee) => (
                  <tr
                    key={fee.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">{fee.name}</td>
                    <td className="px-4 py-3">{fee.feeType}</td>
                    <td className="px-4 py-3">
                      {fee.amountCents != null
                        ? `${(fee.amountCents / 100).toFixed(2)}`
                        : fee.percentBps != null
                          ? `${(fee.percentBps / 100).toFixed(2)}%`
                          : "—"}
                    </td>
                    <td className="px-4 py-3">{fee.currency}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={fee.isActive ? "active" : "deactivated"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function CapitalPoolCard({
  pool,
  onTopUp,
  isLoading,
}: {
  pool: { label: string; account: string; balanceCents: number; asset: string };
  onTopUp: (amountCents: number) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    onTopUp(Math.round(parsed * 100));
    setAmount("");
    setOpen(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{pool.label}</p>
      <p className="mt-1 text-2xl font-bold">
        {formatMoney(pool.balanceCents, pool.asset)}
      </p>
      {open ? (
        <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount (ETB)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-40"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? "..." : "Confirm"}
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
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => setOpen(true)}
        >
          Top Up
        </Button>
      )}
    </div>
  );
}
