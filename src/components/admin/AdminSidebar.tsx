"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Landmark,
  CreditCard,
  RefreshCw,
  ScrollText,
  Flag,
  UserCog,
  Settings,
  LogOut,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
}

const MAIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/customers", label: "Customers", icon: Users, permission: "users:read" },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight, permission: "transactions:read" },
];

const FINANCE_NAV: NavItem[] = [
  { href: "/admin/loans", label: "Loans", icon: Landmark, permission: "loans:read" },
  { href: "/admin/cards", label: "Cards", icon: CreditCard, permission: "cards:read" },
  { href: "/admin/reconciliation", label: "Reconciliation", icon: RefreshCw, permission: "recon:read" },
];

const COMPLIANCE_NAV: NavItem[] = [
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText, permission: "audit:read" },
  { href: "/admin/flags", label: "Flags", icon: Flag, permission: "flags:manage" },
  { href: "/admin/map", label: "Money flow map", icon: MapPin, permission: "analytics:read" },
];

const SYSTEM_NAV: NavItem[] = [
  { href: "/admin/staff", label: "Staff", icon: UserCog, permission: "staff:manage" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "config:manage" },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();
  const hasPermission = useAdminAuthStore((s) => s.hasPermission);

  const visible = items.filter((item) => !item.permission || hasPermission(item.permission));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
        {title}
      </p>
      {visible.map((item) => {
        const active = item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.div
                layoutId="admin-sidebar-indicator"
                className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="h-[18px] w-[18px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  const staff = useAdminAuthStore((s) => s.staff);
  const logout = useAdminAuthStore((s) => s.logout);
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  const initials = staff?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "SA";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card">
      <div className="px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            N
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">Neo Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        <NavSection title="Main" items={MAIN_NAV} />
        <NavSection title="Finance" items={FINANCE_NAV} />
        <NavSection title="Compliance" items={COMPLIANCE_NAV} />
        <NavSection title="System" items={SYSTEM_NAV} />
      </nav>

      <div className="border-t border-border px-3 py-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="flex-1 text-left">
            <p className="truncate text-sm font-medium">{staff?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{staff?.role?.replace(/_/g, " ")}</p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showMenu && "rotate-180")} />
        </button>

        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-md px-5 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </motion.div>
        )}
      </div>
    </aside>
  );
}
