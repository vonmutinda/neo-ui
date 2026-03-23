import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  Layers,
  FileText,
  CreditCard,
  PackageOpen,
  Ship,
  Landmark,
  Tags,
  BookOpen,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type BusinessNavSection = {
  readonly label?: string;
  readonly items: readonly BusinessNavItem[];
};

export type BusinessNavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly badge?: number;
};

export const BUSINESS_NAV_SECTIONS: readonly BusinessNavSection[] = [
  {
    items: [
      { href: "/business", label: "Dashboard", icon: LayoutDashboard },
      { href: "/business/wallets", label: "Wallets", icon: Wallet },
      { href: "/business/transfers", label: "Transfers", icon: ArrowUpRight },
      { href: "/business/payments", label: "Payments", icon: Layers },
      { href: "/business/invoices", label: "Invoices", icon: FileText },
      { href: "/business/cards", label: "Cards", icon: CreditCard },
    ],
  },
  {
    label: "Trade",
    items: [
      { href: "/business/imports", label: "Imports", icon: PackageOpen },
      { href: "/business/exports", label: "Exports", icon: Ship },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/business/loans", label: "Loans", icon: Landmark },
      { href: "/business/tax", label: "Tax", icon: Tags },
      { href: "/business/accounting", label: "Accounting", icon: BookOpen },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/business/team", label: "Team", icon: Users },
      { href: "/business/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;
