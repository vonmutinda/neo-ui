"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  ArrowDownLeft,
  CreditCard,
  AlertTriangle,
  Shield,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notifications";
import type { NotificationPreferences } from "@/lib/types";
import { toast } from "sonner";

interface PreferenceItem {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PREFERENCES: PreferenceItem[] = [
  {
    key: "transferReceived",
    label: "Transfer Received",
    description: "Get notified when you receive a transfer",
    icon: <ArrowDownLeft className="h-4 w-4" />,
  },
  {
    key: "transferSent",
    label: "Transfer Sent",
    description: "Confirmation when your transfer is sent",
    icon: <Send className="h-4 w-4" />,
  },
  {
    key: "paymentCompleted",
    label: "Payment Completed",
    description: "When a bill payment or card payment completes",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    key: "lowBalance",
    label: "Low Balance Alert",
    description: "Warn when your balance drops below a threshold",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    key: "securityAlert",
    label: "Security Alerts",
    description: "Login attempts and security changes",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    key: "marketing",
    label: "Promotions & Updates",
    description: "News, features, and promotional offers",
    icon: <Megaphone className="h-4 w-4" />,
  },
];

export default function NotificationPreferencesPage() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();

  const [values, setValues] = useState<Partial<NotificationPreferences>>({});
  const [dirty, setDirty] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- sync server data into local form state */
  useEffect(() => {
    if (prefs) {
      setValues(prefs);
      setDirty(false);
    }
  }, [prefs]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function togglePref(key: keyof NotificationPreferences) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  }

  function getValue(key: string): boolean {
    return !!(values as Record<string, boolean>)[key];
  }

  async function handleSave() {
    try {
      await updatePrefs.mutateAsync(values as NotificationPreferences);
      toast.success("Preferences updated");
      setDirty(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update preferences",
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" backHref="/profile" />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {PREFERENCES.map((pref, i) => (
            <motion.div
              key={pref.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {pref.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-muted-foreground">
                  {pref.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={getValue(pref.key)}
                onClick={() =>
                  togglePref(pref.key as keyof NotificationPreferences)
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                  getValue(pref.key) ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    getValue(pref.key) ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {dirty && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            size="cta"
            onClick={handleSave}
            disabled={updatePrefs.isPending}
          >
            {updatePrefs.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
