"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  PiggyBank,
  CreditCard,
  ShieldCheck,
  Settings,
  Lock,
  HelpCircle,
  MessageSquare,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-user";
import { useAuthStore } from "@/providers/auth-store";
import { useTelegram } from "@/providers/TelegramProvider";
import { formatPhoneDisplay } from "@/lib/phone-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

function MenuItem({ href, icon: Icon, label }: MenuItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 transition-colors active:bg-muted/80"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y rounded-2xl bg-muted dark:bg-card dark:border dark:border-border">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { logout } = useAuthStore();
  const { haptic } = useTelegram();
  const router = useRouter();

  function handleLogout() {
    haptic("medium");
    logout();
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 py-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Neo User";

  const phone = formatPhoneDisplay(user?.phoneNumber);

  const kycLevel = user?.kycLevel;
  const kycLabel =
    kycLevel === 3 ? "Enhanced" : kycLevel === 2 ? "Verified" : "Basic";
  const kycColor =
    kycLevel === 3 || kycLevel === 2
      ? "bg-success/10 text-success"
      : "bg-warning/10 text-warning-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
          {initials}
        </div>
        <h1 className="text-xl font-semibold">{fullName}</h1>
        {phone && (
          <p className="text-sm text-muted-foreground">{phone}</p>
        )}
        <span
          className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${kycColor}`}
        >
          <ShieldCheck className="h-3 w-3" />
          KYC Level {kycLevel ?? 1} — {kycLabel}
        </span>
      </div>

      <MenuSection title="Account">
        <MenuItem href="/balances" icon={Wallet} label="Currency Balances" />
        <MenuItem href="/pots/new" icon={PiggyBank} label="Pots" />
        <MenuItem href="/cards" icon={CreditCard} label="Linked Cards" />
      </MenuSection>

      <MenuSection title="Verification">
        <MenuItem href="/kyc" icon={ShieldCheck} label="KYC Verification" />
      </MenuSection>

      <MenuSection title="Settings">
        <MenuItem href="/profile/settings" icon={Settings} label="App Settings" />
        <MenuItem href="/profile/security" icon={Lock} label="Security" />
      </MenuSection>

      <MenuSection title="Support">
        <MenuItem href="/profile/settings" icon={HelpCircle} label="Help Center" />
        <MenuItem href="/profile/settings" icon={MessageSquare} label="Contact Us" />
      </MenuSection>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 py-3 text-sm font-medium text-destructive transition-colors active:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </motion.div>
  );
}
