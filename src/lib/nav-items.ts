import {
  Home,
  CreditCard,
  Landmark,
  ArrowLeftRight,
  Users,
  User,
  HandCoins,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recipients", label: "People", icon: Users },
  { href: "/requests", label: "Payments Hub", icon: HandCoins },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/profile", label: "Profile", icon: User },
] as const;
