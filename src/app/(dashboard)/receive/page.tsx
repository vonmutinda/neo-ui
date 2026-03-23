"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAuthStore } from "@/providers/auth-store";

import { useCurrentUser } from "@/hooks/use-user";
import { toE164, formatPhoneDisplay } from "@/lib/phone-utils";

export default function ReceivePage() {
  const userId = useAuthStore((s) => s.userId);
  const { data: user, isLoading, error } = useCurrentUser();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Failed to load your details
        </p>
        <Link href="/" className="text-sm font-medium text-primary">
          Go to dashboard
        </Link>
      </div>
    );
  }

  const rawPhone = toE164(user?.phoneNumber);
  const phone = rawPhone ? formatPhoneDisplay(rawPhone) : "Loading...";
  const qrPayload = `enviar://pay?phone=${encodeURIComponent(rawPhone)}&uid=${userId ?? ""}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(phone.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API unavailable */
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay me on Enviar",
          text: `Send money to my Enviar account: ${phone}`,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col">
      {/* Header */}
      <PageHeader title="Receive" backHref="/" />

      <div className="flex flex-1 flex-col items-center justify-center gap-8 pt-8">
        {/* QR Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="rounded-2xl border border-border/60 bg-primary/5 p-6"
        >
          <QRCodeSVG
            value={qrPayload}
            size={200}
            bgColor="transparent"
            fgColor="currentColor"
            level="M"
            className="text-foreground"
          />
        </motion.div>

        {/* Phone number display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Your phone number
          </span>
          <span className="font-tabular text-2xl font-bold tracking-wide">
            {phone}
          </span>
          <span className="text-xs text-muted-foreground">
            Share this number or QR code to receive payments
          </span>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex w-full gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleCopy}
            className="h-14 flex-1 gap-2 rounded-xl border border-primary text-primary hover:bg-primary/10"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-success" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                Copy
              </>
            )}
          </Button>

          <Button size="cta" onClick={handleShare} className="flex-1 gap-2">
            <Share2 className="h-5 w-5" />
            Share
          </Button>
        </motion.div>

        {/* Info card */}
        <div className="w-full rounded-2xl border border-border/60 bg-primary/5 p-4">
          <p className="text-center text-sm text-foreground/80">
            Transfers from Enviar users are{" "}
            <span className="font-medium text-success">instant and free</span>.
            External bank transfers via EthSwitch may take a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
