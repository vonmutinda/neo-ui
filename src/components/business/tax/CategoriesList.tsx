"use client";

import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { Pencil, Trash2 } from "lucide-react";
import type { TransactionCategory } from "@/lib/business-types";

interface CategoriesListProps {
  categories: TransactionCategory[];
  onEdit?: (category: TransactionCategory) => void;
  onDelete?: (category: TransactionCategory) => void;
  canManage: boolean;
  currencyCode: string;
}

export function CategoriesList({
  categories,
  onEdit,
  onDelete,
  canManage,
  currencyCode,
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

            {/* Name & description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{cat.name}</p>
              {cat.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {cat.description}
                </p>
              )}
            </div>

            {/* Amount & count */}
            <div className="text-right shrink-0">
              {cat.totalCents != null && (
                <p className="font-mono text-sm font-medium tracking-tight">
                  {formatMoney(cat.totalCents, currencyCode, undefined, 0)}
                </p>
              )}
              {cat.transactionCount != null && (
                <p className="text-[11px] text-muted-foreground">
                  {cat.transactionCount}{" "}
                  {cat.transactionCount === 1 ? "txn" : "txns"}
                </p>
              )}
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
