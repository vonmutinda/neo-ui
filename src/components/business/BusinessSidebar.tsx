"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store";
import { useBusinessStore } from "@/providers/business-store";
import { BUSINESS_NAV_SECTIONS } from "@/lib/business-nav-items";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { cn } from "@/lib/utils";

export function BusinessSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();
  const { activeBusiness } = useBusinessStore();

  function isActive(href: string) {
    if (href === "/business") return pathname === "/business";
    return pathname.startsWith(href);
  }

  const bizInitials =
    activeBusiness?.name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "B";

  const userInitials =
    [userProfile?.firstName?.[0], userProfile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const displayName =
    [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") ||
    "User";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 flex w-60 flex-col border-r border-sidebar-border bg-sidebar left-[max(0px,calc(50%-36rem))]",
        className,
      )}
    >
      {/* Logo */}
      <div className="shrink-0 px-4 py-4">
        <Link href="/business" className="inline-flex">
          <EnviarLogo size="md" />
        </Link>
      </div>

      {/* Business switcher */}
      <div className="px-3 pb-3">
        <button className="flex w-full items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5 text-left transition-colors hover:bg-secondary">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-[10px] font-bold text-accent">
            {bizInitials}
          </div>
          <span className="flex-1 truncate text-sm font-medium">
            {activeBusiness?.name ?? "Loading..."}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3">
        {BUSINESS_NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.label && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
            )}
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                      active
                        ? "text-sidebar-active"
                        : "text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="biz-sidebar-indicator"
                        className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.14_75/40%)]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="h-[18px] w-[18px]" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-[11px] font-semibold text-warning-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="shrink-0 border-t border-sidebar-border px-3 py-2.5">
        <Link
          href="/"
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-border hover:text-sidebar-foreground"
        >
          Personal account
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {activeBusiness?.name ? "Member" : ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
