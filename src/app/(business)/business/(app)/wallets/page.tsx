"use client";

import { useState } from "react";
import { useBusinessStore } from "@/providers/business-store";
import { useBusinessWalletSummary } from "@/hooks/business/use-business-wallets";
import { useBusinessTransactions } from "@/hooks/business/use-business-transactions";
import { useCreateCurrencyBalance } from "@/hooks/business/use-business-wallet-manage";
import { useMyPermissions } from "@/hooks/business/use-business-members";
import { WalletsHeroBalance } from "@/components/business/wallets/WalletsHeroBalance";
import { WalletsQuickActions } from "@/components/business/wallets/WalletsQuickActions";
import { WalletsCurrencyGrid } from "@/components/business/wallets/WalletsCurrencyGrid";
import { WalletsTransactionTable } from "@/components/business/wallets/WalletsTransactionTable";
import { WalletsMonthlySummary } from "@/components/business/wallets/WalletsMonthlySummary";
import { WalletsSkeleton } from "@/components/business/wallets/WalletsSkeleton";
import { toast } from "sonner";
import type { SupportedCurrency } from "@/lib/types";
import type { BusinessTransactionDirection } from "@/lib/business-types";

const PAGE_SIZE = 20;

const ALL_CURRENCIES: SupportedCurrency[] = [
  "ETB",
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SAR",
  "CNY",
  "KES",
];

export default function WalletsPage() {
  const { activeBusinessId } = useBusinessStore();
  const { data: walletSummary, isLoading } =
    useBusinessWalletSummary(activeBusinessId);
  const { data: permissions } = useMyPermissions(activeBusinessId);

  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [direction, setDirection] = useState<
    BusinessTransactionDirection | undefined
  >();
  const [page, setPage] = useState(0);

  // Derive primary currency from wallet summary
  const balances = walletSummary?.balances ?? [];
  const primaryCurrency =
    balances.find((b) => b.isPrimary)?.currencyCode ?? "ETB";
  const activeCurrency = selectedCurrency ?? primaryCurrency;

  const { data: txResult } = useBusinessTransactions(activeBusinessId, {
    currency: activeCurrency as SupportedCurrency,
    type: direction,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const createBalance = useCreateCurrencyBalance(activeBusinessId);

  function handleAddCurrency() {
    const existingCodes = new Set(balances.map((b) => b.currencyCode));
    const available = ALL_CURRENCIES.filter((c) => !existingCodes.has(c));

    if (available.length === 0) {
      toast.info("All currencies are already active");
      return;
    }

    const choice = window.prompt(
      `Available currencies:\n${available.join(", ")}\n\nEnter currency code to add:`,
    );

    if (!choice) return;

    const code = choice.trim().toUpperCase() as SupportedCurrency;
    if (!available.includes(code)) {
      toast.error(`Invalid currency: ${choice}`);
      return;
    }

    createBalance.mutate(code, {
      onSuccess: () => toast.success(`${code} wallet added`),
      onError: () => toast.error(`Failed to add ${code} wallet`),
    });
  }

  function handleCurrencySelect(code: string) {
    setSelectedCurrency(code);
    setPage(0);
  }

  function handleDirectionChange(
    dir: BusinessTransactionDirection | undefined,
  ) {
    setDirection(dir);
    setPage(0);
  }

  // Loading state
  if (isLoading || !walletSummary) {
    return <WalletsSkeleton />;
  }

  const transactions = txResult?.data ?? [];
  const totalTx = txResult?.pagination?.total ?? 0;

  return (
    <div>
      {/* Hero Balance */}
      <WalletsHeroBalance
        totalCents={walletSummary.totalHomeCurrencyCents}
        primaryCurrency={primaryCurrency}
        currencyCount={balances.length}
      />

      {/* Quick Actions */}
      <WalletsQuickActions
        onAddCurrency={handleAddCurrency}
        permissions={permissions ?? []}
      />

      {/* Currency Grid */}
      <WalletsCurrencyGrid
        balances={balances}
        selectedCode={activeCurrency}
        onSelect={handleCurrencySelect}
      />

      {/* Transactions + Monthly Summary */}
      <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
        <WalletsTransactionTable
          transactions={transactions}
          total={totalTx}
          page={page}
          onPageChange={setPage}
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />
        <WalletsMonthlySummary
          currencyCode={activeCurrency}
          transactions={transactions}
        />
      </div>
    </div>
  );
}
