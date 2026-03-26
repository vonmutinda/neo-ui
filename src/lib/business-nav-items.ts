import {
  LayoutDashboard,
  ArrowLeftRight,
  ArrowUpRight,
  PiggyBank,
  FileText,
  CreditCard,
  PackageOpen,
  PackageCheck,
  Landmark,
  BookOpen,
  Users,
  FolderOpen,
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
      {
        href: "/business/transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
      },
      { href: "/business/payments", label: "Payments", icon: ArrowUpRight },
      { href: "/business/pots", label: "Pots", icon: PiggyBank },
      { href: "/business/invoices", label: "Invoices", icon: FileText },
      { href: "/business/cards", label: "Cards", icon: CreditCard },
    ],
  },
  {
    label: "Trade",
    items: [
      { href: "/business/imports", label: "Imports", icon: PackageOpen },
      { href: "/business/exports", label: "Exports", icon: PackageCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/business/loans", label: "Loans", icon: Landmark },
      { href: "/business/accounting", label: "Accounting", icon: BookOpen },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/business/team", label: "Team", icon: Users },
      { href: "/business/documents", label: "Documents", icon: FolderOpen },
      { href: "/business/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;
