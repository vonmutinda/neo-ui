"use client";

import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TransfersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onExport: () => void;
}

export function TransfersFilterBar({
  search,
  onSearchChange,
  onExport,
}: TransfersFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Search transfers..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Export */}
      <button
        onClick={onExport}
        className={cn(
          "flex h-12 items-center gap-2 rounded-xl border border-input bg-background px-4 text-sm font-medium",
          "transition-colors hover:bg-secondary/60 active:bg-secondary",
        )}
      >
        <Download className="h-4 w-4" />
        Export
      </button>
    </div>
  );
}
