"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Smartphone,
  Zap,
  Tv,
  Building,
  GraduationCap,
  Shield,
  Car,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

interface ServiceCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const CATEGORIES: ServiceCategory[] = [
  {
    id: "airtime",
    label: "Airtime & Data",
    description: "Ethio Telecom top-ups",
    icon: Smartphone,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "utilities",
    label: "Utilities",
    description: "Electricity, water bills",
    icon: Zap,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "tv-internet",
    label: "TV & Internet",
    description: "DSTV, internet services",
    icon: Tv,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "government",
    label: "Government",
    description: "Tax, permits, licenses",
    icon: Building,
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    id: "education",
    label: "Education",
    description: "School fees, tuition",
    icon: GraduationCap,
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    id: "insurance",
    label: "Insurance",
    description: "Premium payments",
    icon: Shield,
    color: "text-sky-500 bg-sky-500/10",
  },
  {
    id: "transport",
    label: "Transport",
    description: "Ride services, fuel",
    icon: Car,
    color: "text-rose-500 bg-rose-500/10",
  },
];

export default function PaymentsHubPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Pay Bills" backHref="/" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
          >
            <Link
              href={`/payments/${cat.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color}`}
              >
                <cat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {cat.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {cat.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
