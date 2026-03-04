"use client";

import Link from "next/link";
import {
  Send,
  QrCode,
  HandCoins,
  ArrowLeftRight,
} from "lucide-react";

const actions = [
  { href: "/send", icon: Send, label: "Send", color: "bg-primary/10 text-primary" },
  { href: "/receive", icon: QrCode, label: "Receive", color: "bg-success/10 text-success" },
  { href: "/requests/new", icon: HandCoins, label: "Request", color: "bg-amber-500/10 text-amber-500" },
  { href: "/convert", icon: ArrowLeftRight, label: "Convert", color: "bg-accent/20 text-accent-foreground" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`${action.color} flex h-14 w-14 items-center justify-center rounded-2xl transition-transform active:scale-95`}
          >
            <action.icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
