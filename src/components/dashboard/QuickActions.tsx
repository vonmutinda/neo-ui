"use client";

import Link from "next/link";
import { Send, HandCoins, ArrowLeftRight } from "lucide-react";

const actions = [
  {
    href: "/send",
    icon: Send,
    label: "Send",
    bg: "bg-primary text-primary-foreground shadow-[0_4px_12px_oklch(0.72_0.14_75/30%)]",
  },
  {
    href: "/requests/new",
    icon: HandCoins,
    label: "Request",
    bg: "bg-secondary text-secondary-foreground border border-border/60 shadow-[0_1px_3px_oklch(0.40_0.06_70/6%)]",
  },
  {
    href: "/convert",
    icon: ArrowLeftRight,
    label: "Convert",
    bg: "bg-accent text-accent-foreground shadow-[0_4px_12px_oklch(0.67_0.115_68/25%)]",
  },
];

export function QuickActions() {
  return (
    <div className="flex justify-around">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg}`}
          >
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
