"use client";

import { Building2, ShieldCheck, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "profile", label: "Profile", icon: Building2 },
  { key: "verification", label: "Verification", icon: ShieldCheck },
  { key: "policies", label: "Policies", icon: ScrollText },
] as const;

interface SettingsNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function SettingsNav({
  activeSection,
  onSectionChange,
}: SettingsNavProps) {
  return (
    <nav className="flex w-[200px] shrink-0 flex-col gap-1">
      {SECTIONS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onSectionChange(key)}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
            activeSection === key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </button>
      ))}
    </nav>
  );
}
