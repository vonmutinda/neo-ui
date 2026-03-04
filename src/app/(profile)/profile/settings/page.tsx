"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Moon, Bell, Globe } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SettingRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
}

function SettingRow({ icon: Icon, label, description }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Badge variant="secondary" className="text-[10px]">
        Coming soon
      </Badge>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">App Settings</h1>
      </div>

      <div className="divide-y rounded-2xl border bg-card">
        <SettingRow
          icon={Moon}
          label="Dark Mode"
          description="Switch between light and dark themes"
        />
        <SettingRow
          icon={Bell}
          label="Push Notifications"
          description="Receive alerts for transactions and updates"
        />
        <SettingRow
          icon={Globe}
          label="Language"
          description="Choose your preferred language"
        />
      </div>
    </motion.div>
  );
}
