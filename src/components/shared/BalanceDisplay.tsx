"use client";

import { motion } from "framer-motion";

export function BalanceDisplay({
  display,
  label,
  size = "lg",
}: {
  display: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const textSize = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
      <motion.span
        className={`${textSize} font-tabular font-bold tracking-tight`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {display}
      </motion.span>
    </div>
  );
}
