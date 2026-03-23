import {
  Home,
  Building2,
  CreditCard,
  Landmark,
  ArrowLeftRight,
  Users,
  Wallet,
  ReceiptText,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/business", label: "Business", icon: Building2 },
  { href: "/recipients", label: "People", icon: Users },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/bill-payments", label: "Bill Payments", icon: ReceiptText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export const BOTTOM_NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/bill-payments", label: "Bill Payments", icon: ReceiptText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;
