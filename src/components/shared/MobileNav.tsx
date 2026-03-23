"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/providers/auth-store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav-items";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { userProfile } = useAuthStore();
  const [open, setOpen] = useState(false);

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
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex h-12 items-center gap-2.5 px-3.5">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            showCloseButton={false}
            className="w-56 gap-0 p-0"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>

            <div className="px-5 py-6">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="inline-flex"
              >
                <EnviarLogo size="md" />
              </Link>
            </div>

            <nav className="flex-1 space-y-0.5 px-3">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="mobile-sidebar-indicator"
                        className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_oklch(0.72_0.14_75/40%)]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border px-3 py-3">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-[0_2px_6px_oklch(0.72_0.14_75/25%)]">
                  {initials}
                </div>
                <span className="flex-1 truncate text-left font-medium">
                  {displayName}
                </span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="inline-flex">
          <EnviarLogo size="sm" />
        </Link>
      </div>
    </header>
  );
}
