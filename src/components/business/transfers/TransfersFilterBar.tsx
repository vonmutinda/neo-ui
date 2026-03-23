"use client";

import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SupportedCurrency } from "@/lib/types";
import type { BusinessTransferType } from "@/lib/business-types";

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Currencies" },
  { value: "ETB", label: "ETB" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "AED", label: "AED" },
  { value: "SAR", label: "SAR" },
  { value: "CNY", label: "CNY" },
  { value: "KES", label: "KES" },
];

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
];

interface TransfersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  currencyCode: SupportedCurrency | "";
  onCurrencyChange: (value: SupportedCurrency | "") => void;
  transferType: BusinessTransferType | "";
  onTransferTypeChange: (value: BusinessTransferType | "") => void;
  onExport: () => void;
}

export function TransfersFilterBar({
  search,
  onSearchChange,
  currencyCode,
  onCurrencyChange,
  transferType,
  onTransferTypeChange,
  onExport,
}: TransfersFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Search transfers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Currency filter */}
      <select
        value={currencyCode}
        onChange={(e) =>
          onCurrencyChange(e.target.value as SupportedCurrency | "")
        }
        className={cn(
          "h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
          "transition-[color,box-shadow]",
        )}
      >
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Type filter */}
      <select
        value={transferType}
        onChange={(e) =>
          onTransferTypeChange(e.target.value as BusinessTransferType | "")
        }
        className={cn(
          "h-12 rounded-xl border border-input bg-background px-4 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/30 focus-visible:ring-[3px]",
          "transition-[color,box-shadow]",
        )}
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Export */}
      <button
        onClick={onExport}
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border border-input bg-background px-4 text-sm font-medium",
          "transition-colors hover:bg-secondary/60 active:bg-secondary",
        )}
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}
