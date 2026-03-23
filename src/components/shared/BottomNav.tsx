"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS } from "@/lib/nav-items";

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Main navigation"
      role="navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 pb-safe pt-1.5"
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "h-[18px] w-[18px] transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1.5 h-0.5 w-5 rounded-full bg-primary shadow-[0_0_6px_oklch(0.72_0.14_75/40%)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold",
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
