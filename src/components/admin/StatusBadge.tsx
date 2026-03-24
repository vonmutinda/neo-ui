import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/15 text-success",
  completed: "bg-success/15 text-success",
  verified: "bg-success/15 text-success",
  resolved: "bg-success/15 text-success",
  repaid: "bg-success/15 text-success",
  healthy: "bg-success/15 text-success",

  pending: "bg-warning/15 text-warning-foreground",
  investigating: "bg-warning/15 text-warning-foreground",
  in_arrears: "bg-warning/15 text-warning-foreground",
  warning: "bg-warning/15 text-warning-foreground",
  degraded: "bg-warning/15 text-warning-foreground",

  frozen: "bg-destructive/15 text-destructive",
  defaulted: "bg-destructive/15 text-destructive",
  failed: "bg-destructive/15 text-destructive",
  declined: "bg-destructive/15 text-destructive",
  escalated: "bg-destructive/15 text-destructive",
  critical: "bg-destructive/15 text-destructive",

  cancelled: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
  written_off: "bg-muted text-muted-foreground",
  deactivated: "bg-muted text-muted-foreground",
  info: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) {
  if (!status) return null;
  const colors = STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-3xl px-2.5 py-0.5 text-xs font-semibold capitalize",
        colors,
        className,
      )}
    >
      {label}
    </span>
  );
}
