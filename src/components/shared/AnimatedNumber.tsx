"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  formatFn?: (n: number) => string;
}

export function AnimatedNumber({
  value,
  className,
  formatFn,
}: AnimatedNumberProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (latest) =>
    formatFn
      ? formatFn(Math.round(latest))
      : Math.round(latest).toLocaleString(),
  );
  const [text, setText] = useState(formatFn ? formatFn(0) : "0");
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      spring.set(value);
      mounted.current = true;
    } else {
      spring.set(value);
    }
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => setText(v));
    return unsubscribe;
  }, [display]);

  return <motion.span className={className}>{text}</motion.span>;
}
