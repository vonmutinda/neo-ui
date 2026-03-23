"use client";

import {
  useAdminSystemAccounts,
  useAdminTopUpCapital,
} from "@/hooks/admin/use-admin-system-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { formatMoney } from "@/lib/format";

export default function AdminCapitalPage() {
  const { data, isLoading } = useAdminSystemAccounts();
  const topUp = useAdminTopUpCapital();
  const [amount, setAmount] = useState("");
  const [pool, setPool] = useState<"loan_capital" | "overdraft_capital">(
    "loan_capital",
  );

  const pools = data?.pools ?? [];
  const cents = Math.round(parseFloat(amount || "0") * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System accounts</h1>
      <p className="text-sm text-muted-foreground">
        Capital pools and treasury balances.
      </p>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="px-4 py-3 font-semibold">Label</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
                <th className="px-4 py-3 font-semibold">Asset</th>
              </tr>
            </thead>
            <tbody>
              {pools.map((p) => (
                <tr
                  key={p.account}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">{p.label}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.account}</td>
                  <td className="px-4 py-3 font-tabular">
                    {formatMoney(p.balanceCents, p.asset)}
                  </td>
                  <td className="px-4 py-3">{p.asset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3 max-w-md">
        <h2 className="text-sm font-semibold">Top up (treasury)</h2>
        <select
          value={pool}
          onChange={(e) =>
            setPool(e.target.value as "loan_capital" | "overdraft_capital")
          }
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="loan_capital">Loan capital</option>
          <option value="overdraft_capital">Overdraft capital</option>
        </select>
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Amount (ETB)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Button
          disabled={cents <= 0 || topUp.isPending}
          onClick={() => topUp.mutate({ pool, amountCents: cents })}
        >
          {topUp.isPending ? "Submitting…" : "Top up"}
        </Button>
      </div>
    </div>
  );
}
