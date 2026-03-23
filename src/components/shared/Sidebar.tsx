"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/providers/auth-store";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-items";
import { EnviarLogo } from "@/components/shared/EnviarLogo";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const initials =
    [userProfile?.firstName?.[0], userProfile?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U";

  const displayName =
    [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(" ") ||
    userProfile?.phoneNumber ||
    "User";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 flex w-56 flex-col border-r border-sidebar-border bg-sidebar left-[max(0px,calc(50%-36rem))]",
        className,
      )}
    >
      <div className="shrink-0 px-3 py-4">
        <Link href="/" className="inline-flex">
          <EnviarLogo size="md" />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <nav className="space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
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
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.14_75/40%)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-sidebar-border px-3 py-2.5">
        <Link
          href="/profile"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-border"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-[0_2px_6px_oklch(0.72_0.14_75/25%)]">
            {initials}
          </div>
          <span className="flex-1 truncate text-left font-medium">
            {displayName}
          </span>
        </Link>
      </div>
    </aside>
  );
}
