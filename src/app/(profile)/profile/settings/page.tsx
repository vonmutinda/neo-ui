"use client";

import { motion } from "framer-motion";
import { Moon, Bell, Globe, Coins } from "lucide-react";
import { useTheme } from "next-themes";
import { useDisplayCurrency } from "@/lib/display-currency-store";
import type { SupportedCurrency } from "@/lib/types";
import { PageHeader } from "@/components/shared/PageHeader";

const CURRENCY_OPTIONS: { code: SupportedCurrency; label: string }[] = [
  { code: "ETB", label: "ETB — Ethiopian Birr" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SAR", label: "SAR — Saudi Riyal" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "KES", label: "KES — Kenyan Shilling" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Moon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Dark Mode</p>
          <p className="text-xs text-muted-foreground">
            {isDark ? "On" : "Off"} — switch between light and dark themes
          </p>
        </div>
      </div>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className={`flex h-7 w-12 items-center rounded-full px-0.5 transition-colors ${
          isDark ? "bg-primary" : "bg-muted"
        }`}
        role="switch"
        aria-checked={isDark}
      >
        <motion.div
          className="h-6 w-6 rounded-full bg-white shadow-sm"
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function DisplayCurrencySelector() {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Coins className="h-5 w-5 text-primary/70" />
        <div>
          <p className="text-sm font-medium">Display Currency</p>
          <p className="text-xs text-muted-foreground">
            Total balance shown in this currency
          </p>
        </div>
      </div>
      <select
        value={displayCurrency}
        onChange={(e) =>
          setDisplayCurrency(e.target.value as SupportedCurrency)
        }
        className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.code}
          </option>
        ))}
      </select>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  trailing?: React.ReactNode;
}

function SettingRow({
  icon: Icon,
  label,
  description,
  trailing,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary/70" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {trailing}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Settings" backHref="/profile" />

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Appearance
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep the app comfortable to use and aligned with your device.
        </p>
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <ThemeToggle />
        <DisplayCurrencySelector />
        <SettingRow
          icon={Bell}
          label="Push Notifications"
          description="Notifications will follow the preferences available on your device."
          trailing={
            <span className="text-xs font-medium text-muted-foreground">
              Device-managed
            </span>
          }
        />
        <SettingRow
          icon={Globe}
          label="Language"
          description="Enviar currently uses English across the personal app."
          trailing={
            <span className="text-xs font-medium text-muted-foreground">
              English
            </span>
          }
        />
      </div>
    </motion.div>
  );
}
