"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

const CATEGORY_LABELS: Record<string, string> = {
  airtime: "Airtime & Data",
  utilities: "Utilities",
  "tv-internet": "TV & Internet",
  government: "Government",
  education: "Education",
  insurance: "Insurance",
  transport: "Transport",
};

const PROVIDERS: Record<string, { name: string; description: string }[]> = {
  airtime: [
    { name: "Ethio Telecom", description: "Airtime top-up & data bundles" },
  ],
  utilities: [
    { name: "EELPA", description: "Ethiopian Electric Power" },
    { name: "Addis Ababa Water", description: "Water utility bills" },
  ],
  "tv-internet": [
    { name: "DSTV", description: "Satellite TV subscription" },
    { name: "Ethio Telecom Internet", description: "Home broadband" },
  ],
  government: [
    { name: "e-Tax (MoR)", description: "Ministry of Revenue" },
    { name: "Trade Licenses", description: "Business permits & renewals" },
  ],
  education: [
    { name: "School Fees", description: "Pay tuition & school fees" },
  ],
  insurance: [{ name: "EIC", description: "Ethiopian Insurance Corporation" }],
  transport: [
    { name: "Ride", description: "Ride-hailing top-up" },
    { name: "NOC Fuel", description: "Fuel payment" },
  ],
};

export default function PaymentCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const label = CATEGORY_LABELS[category] ?? category;
  const providers = PROVIDERS[category] ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title={label} backHref="/payments" />

      {providers.length > 0 ? (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
          {providers.map((p) => (
            <button
              key={p.name}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 active:bg-muted"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {p.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <span className="rounded-md bg-muted/50 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                Coming soon
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No providers yet"
          description="Providers for this category will be added soon."
        />
      )}
    </motion.div>
  );
}
