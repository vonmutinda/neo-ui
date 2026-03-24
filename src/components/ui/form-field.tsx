import { useId, type ReactNode } from "react";
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
 * Generates a unique ID for error/hint text and exposes it as a
 * `data-describedby` attribute on the wrapper so consumers can
 * wire aria-describedby if needed.
 */
export function FormField({
  label,
  error,
  children,
  className,
  hint,
}: FormFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const hintId = !error && hint ? `${id}-hint` : undefined;
  const describedBy = errorId || hintId;

  return (
    <div
      className={cn("space-y-1.5", className)}
      {...(describedBy ? { "data-describedby": describedBy } : {})}
    >
      <label className="block text-xs font-medium text-foreground/70">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
