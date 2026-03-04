"use client";

import { useAdminConfig } from "@/hooks/admin/use-admin-config";
import { useAdminFXRates } from "@/hooks/admin/use-admin-fx-rates";
import { useAdminFeeSchedules } from "@/hooks/admin/use-admin-fees";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: configData, isLoading: configLoading } = useAdminConfig();
  const { data: fxData, isLoading: fxLoading } = useAdminFXRates();
  const { data: feesData, isLoading: feesLoading } = useAdminFeeSchedules();

  const config = configData ?? [];
  const fxRates = fxData ?? [];
  const feeSchedules = feesData ?? [];

  return (
    <div className="space-y-8">
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
            <p className="px-4 py-8 text-center text-muted-foreground">No config entries</p>
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
                  <tr key={entry.key} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{entry.key}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeof entry.value === "object" ? JSON.stringify(entry.value) : String(entry.value)}
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
            <p className="px-4 py-8 text-center text-muted-foreground">No FX rates</p>
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
                  <tr key={rate.id} className="border-b border-border last:border-0">
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
            <p className="px-4 py-8 text-center text-muted-foreground">No fee schedules</p>
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
                  <tr key={fee.id} className="border-b border-border last:border-0">
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
                      <StatusBadge status={fee.isActive ? "active" : "deactivated"} />
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
