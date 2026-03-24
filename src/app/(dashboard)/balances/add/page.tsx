"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import { useBalances, useCreateBalance } from "@/hooks/use-balances";
import type { SupportedCurrency } from "@/lib/types";

const ALL_CURRENCIES: {
  code: SupportedCurrency;
  name: string;
}[] = [
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "KES", name: "Kenyan Shilling" },
];

// TODO: Gate access based on KYC level once KYC enforcement is implemented.
// Users should only be able to add certain currencies at higher KYC tiers.

export default function AddBalancePage() {
  const router = useRouter();
  const { data: balances, isLoading } = useBalances();
  const createBalance = useCreateBalance();

  const existingCodes = new Set((balances ?? []).map((b) => b.currencyCode));

  const available = ALL_CURRENCIES.filter((c) => !existingCodes.has(c.code));

  function handleSelect(code: SupportedCurrency) {
    createBalance.mutate(
      { currencyCode: code },
      {
        onSuccess: () => {
          toast.success(`${code} balance activated`);
          router.push("/");
        },
        onError: () => toast.error(`Failed to activate ${code} balance`),
      },
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Add Currency" backHref="/" />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-muted/50"
            />
          ))}
        </div>
      ) : available.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Check className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            All currencies are already active
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Select a currency to activate a new balance.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((currency, i) => (
              <motion.button
                key={currency.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => handleSelect(currency.code)}
                disabled={createBalance.isPending}
                className="flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:bg-muted/50 active:bg-muted disabled:opacity-50 disabled:pointer-events-none"
              >
                <CurrencyFlag currency={currency.code} size="lg" />
                <div className="text-center">
                  <p className="text-sm font-medium">{currency.code}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {currency.name}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
