import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}

/**
 * Wraps an input with a label and optional inline error message.
 * Drop-in replacement for the manual <div><label>...<Input /> pattern.
 */
export function FormField({
  label,
  error,
  children,
  className,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs font-medium text-foreground/70">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
