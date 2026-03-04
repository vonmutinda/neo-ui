"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, CreditCard, Landmark, ArrowLeftRight, Users, User } from "lucide-react";
import { useTelegram } from "@/providers/TelegramProvider";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recipients", label: "People", icon: Users },
  { href: "/cards", label: "Cards", icon: CreditCard },
  { href: "/loans", label: "Loans", icon: Landmark },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const { haptic } = useTelegram();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Main navigation"
      role="navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={() => haptic("light")}
              className="relative flex flex-1 flex-col items-center gap-0.5 pb-safe pt-2.5"
            >
              <div className="relative flex h-7 w-7 items-center justify-center">
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-[22px] w-[22px] transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1.5 h-0.5 w-5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
