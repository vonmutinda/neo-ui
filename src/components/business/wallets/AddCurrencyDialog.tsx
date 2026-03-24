"use client";

import { CurrencyFlag } from "@/components/shared/CurrencyFlag";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { SupportedCurrency } from "@/lib/types";

interface AddCurrencyDialogProps {
  open: boolean;
  onClose: () => void;
  availableCurrencies: SupportedCurrency[];
  onSelect: (code: SupportedCurrency) => void;
  isPending?: boolean;
}

const CURRENCY_NAMES: Record<string, string> = {
  ETB: "Ethiopian Birr",
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  CNY: "Chinese Yuan",
  KES: "Kenyan Shilling",
};

export function AddCurrencyDialog({
  open,
  onClose,
  availableCurrencies,
  onSelect,
  isPending,
}: AddCurrencyDialogProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Add Currency</SheetTitle>
          <SheetDescription>
            Select a currency to create a new wallet balance.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-4">
          {availableCurrencies.map((code) => (
            <button
              key={code}
              onClick={() => onSelect(code)}
              disabled={isPending}
              className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/50 active:bg-muted disabled:opacity-50 disabled:pointer-events-none"
            >
              <CurrencyFlag currency={code} size="md" />
              <div className="text-center">
                <p className="text-sm font-medium">{code}</p>
                <p className="text-[10px] text-muted-foreground">
                  {CURRENCY_NAMES[code] ?? code}
                </p>
              </div>
            </button>
          ))}
        </div>
        {availableCurrencies.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            All currencies are already active.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
