"use client";

import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import type { TransactionCategory } from "@/lib/business-types";

interface CategoriesListProps {
  categories: TransactionCategory[];
  onEdit?: (category: TransactionCategory) => void;
  onDelete?: (category: TransactionCategory) => void;
  canManage: boolean;
  currencyCode?: string;
}

export function CategoriesList({
  categories,
  onEdit,
  onDelete,
  canManage,
}: CategoriesListProps) {
  if (categories.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        No categories yet
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
      )}
    >
      <div className="divide-y divide-border/40">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/30"
          >
            {/* Color dot */}
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: cat.color }}
            />

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{cat.name}</p>
            </div>

            {/* Actions */}
            {canManage && !cat.isSystem && (
              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => onEdit(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                    aria-label="Edit category"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-destructive/10"
                    aria-label="Delete category"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
