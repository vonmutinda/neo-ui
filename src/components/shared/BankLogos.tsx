import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const BANK_CONFIGS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  CBE: { bg: "#6B21A8", text: "#fff", label: "CBE" },
  DASHEN: { bg: "#EA580C", text: "#fff", label: "D" },
  AWASH: { bg: "#16A34A", text: "#fff", label: "AW" },
  ABYSSINIA: { bg: "#2563EB", text: "#fff", label: "BoA" },
};

function BankCircle({
  bg,
  text,
  label,
  className,
}: {
  bg: string;
  text: string;
  label: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <circle cx="20" cy="20" r="20" fill={bg} />
      <text
        x="20"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill={text}
        fontFamily="system-ui, sans-serif"
        fontWeight="700"
        fontSize={label.length > 2 ? "10" : "14"}
      >
        {label}
      </text>
    </svg>
  );
}

export function BankLogo({
  institutionId,
  className,
}: {
  institutionId: string;
  className?: string;
}) {
  const config = BANK_CONFIGS[institutionId];

  if (!config) {
    return <Users className={cn("shrink-0 text-primary", className)} />;
  }

  return (
    <BankCircle
      bg={config.bg}
      text={config.text}
      label={config.label}
      className={className}
    />
  );
}
