import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-2xl bg-muted",
        "bg-[length:200%_100%] bg-[linear-gradient(90deg,var(--color-muted)_25%,oklch(0.72_0.14_75/8%)_50%,var(--color-muted)_75%)] animate-[shimmer_1.5s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
