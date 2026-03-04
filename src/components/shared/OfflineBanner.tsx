"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { AnimatePresence, motion } from "framer-motion";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-amber-500 text-amber-950"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5" />
            You are offline. Some features may be unavailable.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
