"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from "framer-motion";
import { ArrowRight, Check, Loader2 } from "lucide-react";

interface SlideToConfirmProps {
  onConfirm: () => void;
  isPending: boolean;
  isSuccess: boolean;
  label?: string;
}

const THUMB_SIZE = 56;
const PADDING = 4;
const CONFIRM_THRESHOLD = 0.75;

export function SlideToConfirm({
  onConfirm,
  isPending,
  isSuccess,
  label = "Slide to send",
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const x = useMotionValue(0);

  const maxTravel = Math.max(trackWidth - THUMB_SIZE - PADDING * 2, 0);

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    measureTrack();
    window.addEventListener("resize", measureTrack);
    return () => window.removeEventListener("resize", measureTrack);
  }, [measureTrack]);

  const bgOpacity = useTransform(
    x,
    [0, maxTravel * 0.7 || 1],
    [0, 1],
  );
  const labelOpacity = useTransform(
    x,
    [0, maxTravel * 0.35 || 1],
    [1, 0],
  );

  useEffect(() => {
    if (!isSuccess && !isPending && confirmed) {
      setConfirmed(false);
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }, [isSuccess, isPending, confirmed, x]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (maxTravel <= 0) return;

    const currentX = x.get();
    const threshold = maxTravel * CONFIRM_THRESHOLD;

    if (currentX >= threshold || (info.velocity.x > 500 && currentX > maxTravel * 0.4)) {
      animate(x, maxTravel, { duration: 0.12, ease: "easeOut" });
      setConfirmed(true);
      onConfirm();
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  const done = isSuccess;
  const showThumb = !done && !isPending && !confirmed;

  return (
    <div
      ref={trackRef}
      className="relative flex h-16 items-center overflow-hidden rounded-full border bg-card"
      style={{ padding: PADDING }}
    >
      {/* Progress fill */}
      <motion.div
        className="absolute inset-0 rounded-full bg-success/20"
        style={{ opacity: bgOpacity }}
      />

      {/* Label */}
      <motion.span
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-muted-foreground"
        style={{ opacity: labelOpacity }}
      >
        {done || isPending || confirmed ? "" : label}
      </motion.span>

      {/* Draggable thumb */}
      {showThumb && maxTravel > 0 && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxTravel }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x, touchAction: "none" }}
          className="relative z-10 flex h-12 w-14 cursor-grab items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:cursor-grabbing"
        >
          <ArrowRight className="h-5 w-5" />
        </motion.div>
      )}

      {/* Pending state */}
      {(isPending || (confirmed && !done)) && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-full w-full items-center justify-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm font-medium">Sending...</span>
        </motion.div>
      )}

      {/* Success state */}
      {done && !isPending && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-full w-full items-center justify-center"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground">
            <Check className="h-5 w-5" />
          </div>
          <span className="ml-2 text-sm font-semibold text-success">
            Sent!
          </span>
        </motion.div>
      )}
    </div>
  );
}
