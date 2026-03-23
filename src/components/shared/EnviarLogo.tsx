import { cn } from "@/lib/utils";

/**
 * Enviar "Naked Arrow" logo — bare arrow icon + wordmark.
 *
 * Sizes:
 *  - sm  → 20px icon, 14px text  (mobile nav bar)
 *  - md  → 28px icon, 16px text  (sidebar, default)
 *  - lg  → 40px icon, 22px text  (splash / marketing)
 */
export function EnviarLogo({
  size = "md",
  iconOnly = false,
  className,
}: {
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  className?: string;
}) {
  const dim = { sm: 20, md: 28, lg: 40 }[size];
  const textClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-[22px]",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {/* Icon — naked arrow, tight viewBox */}
      <svg
        width={dim}
        height={dim}
        viewBox="12 14 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M28 52V20"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="text-primary"
        />
        <path
          d="M14 34L28 16L42 34"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>

      {/* Wordmark */}
      {!iconOnly && (
        <span
          className={cn("font-bold tracking-tight text-primary", textClass)}
        >
          enviar
        </span>
      )}
    </span>
  );
}
