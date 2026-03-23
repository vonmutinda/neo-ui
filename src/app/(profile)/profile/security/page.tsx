"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-user";
import { formatPhoneDisplay } from "@/lib/phone-utils";
import { PageHeader } from "@/components/shared/PageHeader";

interface SecurityRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  value?: React.ReactNode;
  href?: string;
}

function SecurityRow({
  icon: Icon,
  label,
  description,
  value,
  href,
}: SecurityRowProps) {
  const content = (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary/70" />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value}
        {href ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function SecurityPage() {
  const { data: user } = useCurrentUser();
  const kycLevel = user?.kycLevel ?? 1;
  const kycLabel =
    kycLevel >= 3 ? "Enhanced" : kycLevel === 2 ? "Verified" : "Basic";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Security" backHref="/profile" />

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold">Your account protections</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enviar keeps your account safer by tying access to your verified
              identity and your registered phone.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card">
        <SecurityRow
          icon={KeyRound}
          label="Identity verification"
          description="Your verification level controls available limits and trust."
          href="/kyc"
          value={
            <Badge
              variant="outline"
              className="border-0 bg-primary/10 text-primary"
            >
              {kycLabel}
            </Badge>
          }
        />
        <SecurityRow
          icon={Smartphone}
          label="Phone on account"
          description="This phone number is used for access and account recovery."
          value={
            <span className="text-xs font-medium text-muted-foreground">
              {formatPhoneDisplay(user?.phoneNumber) || "Unavailable"}
            </span>
          }
        />
        <SecurityRow
          icon={CheckCircle2}
          label="Transaction confirmation"
          description="Review recipient details carefully before approving any money movement."
          value={
            <Badge
              variant="outline"
              className="border-0 bg-success/10 text-success"
            >
              Active
            </Badge>
          }
        />
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-sm font-semibold text-muted-foreground">Stay safe</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>Never share OTPs or recovery codes with anyone.</li>
          <li>Always confirm recipient names before sending money.</li>
          <li>Use KYC verification to unlock stronger account trust.</li>
        </ul>
      </div>

      {kycLevel < 2 && (
        <Button
          asChild
          className="w-full rounded-xl border border-primary bg-primary text-primary-foreground hover:opacity-90"
        >
          <Link href="/kyc">Complete verification</Link>
        </Button>
      )}
    </motion.div>
  );
}
