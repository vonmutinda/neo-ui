"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { CATEGORY_COLORS } from "@/lib/business-utils";
import type { CreateCategoryRequest } from "@/lib/business-types";

interface CreateCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: CreateCategoryRequest) => void;
  isSubmitting: boolean;
}

export function CreateCategoryDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: CreateCategoryDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      color,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-card p-6",
          "shadow-[0_2px_8px_oklch(0.40_0.06_70/4%),0_1px_2px_oklch(0.40_0.06_70/6%)]",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-category-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            id="create-category-title"
            className="text-base font-semibold text-foreground"
          >
            New Category
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                "mt-1 h-10 w-full rounded-xl bg-secondary px-3 text-sm outline-none",
                "focus:ring-2 focus:ring-foreground/20",
              )}
              placeholder="e.g. Office Supplies"
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Color
            </label>
            <div className="mt-2 flex gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                      : "hover:scale-105",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "h-10 w-full rounded-xl bg-foreground text-sm font-medium text-background",
              "transition-opacity hover:opacity-90 active:opacity-80",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            {isSubmitting ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
