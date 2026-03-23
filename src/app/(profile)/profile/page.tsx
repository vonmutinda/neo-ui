"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useCurrentUser } from "@/hooks/use-user";
import { useAuthStore } from "@/providers/auth-store";

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
        <Icon className="h-5 w-5 text-primary/70" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const { logout } = useAuthStore();

  const router = useRouter();

  function handleLogout() {
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

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Enviar User";

  const phone = formatPhoneDisplay(user?.phoneNumber);

  const kycLevel = user?.kycLevel;
  const kycLabel =
    kycLevel === 3 ? "Enhanced" : kycLevel === 2 ? "Verified" : "Basic";
  const kycColor =
    kycLevel === 3 || kycLevel === 2
      ? "bg-success/10 text-success"
      : "bg-warning/10 text-warning-foreground";

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" />

      <div className="rounded-2xl border border-border/60 bg-card px-6 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground">
            {initials}
          </div>
          <h1 className="text-xl font-semibold text-foreground">{fullName}</h1>
          {phone && <p className="text-sm text-muted-foreground">{phone}</p>}
          <span
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${kycColor}`}
          >
            <ShieldCheck className="h-3 w-3" />
            KYC Level {kycLevel ?? 1} — {kycLabel}
          </span>
        </div>
      </div>

      <MenuSection title="Account">
        <MenuItem href="/kyc" icon={ShieldCheck} label="KYC Verification" />
      </MenuSection>

      <MenuSection title="Settings">
        <MenuItem
          href="/profile/settings"
          icon={Settings}
          label="App Settings"
        />
        <MenuItem href="/profile/security" icon={Lock} label="Security" />
      </MenuSection>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-medium text-destructive transition-colors active:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
