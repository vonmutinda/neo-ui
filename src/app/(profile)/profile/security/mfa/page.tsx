"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMFASetup, useMFAConfirm, useMFADisable } from "@/hooks/use-auth";
import { toast } from "sonner";

type Step = "idle" | "setup" | "verify" | "backup" | "disable";

export default function MFAPage() {
  const mfaSetup = useMFASetup();
  const mfaConfirm = useMFAConfirm();
  const mfaDisable = useMFADisable();

  const [step, setStep] = useState<Step>("idle");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  async function handleSetup() {
    try {
      const data = await mfaSetup.mutateAsync();
      setQrCodeUrl(data.qrCodeUri);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes ?? []);
      setStep("verify");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set up MFA");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) return;

    try {
      await mfaConfirm.mutateAsync({ code: verificationCode });
      setStep("backup");
      toast.success("MFA enabled successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Invalid verification code",
      );
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    if (!disableCode) return;

    try {
      await mfaDisable.mutateAsync({ code: disableCode });
      toast.success("MFA disabled");
      setStep("idle");
      setConfirmDisable(false);
      setDisableCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to disable MFA");
    }
  }

  function copyCode(code: string, index: number) {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function copyAllCodes() {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    toast.success("Backup codes copied");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Two-Factor Auth" backHref="/profile/security" />

      {/* Idle state - setup or disable */}
      {step === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">
                Multi-Factor Authentication
              </p>
              <p className="mt-1 max-w-[280px] text-sm text-muted-foreground">
                Add an extra layer of security to your account using an
                authenticator app.
              </p>
            </div>
          </div>

          <Button
            size="cta"
            onClick={handleSetup}
            disabled={mfaSetup.isPending}
            className="gap-2"
          >
            {mfaSetup.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Setting up...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" /> Enable MFA
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="cta"
            onClick={() => setConfirmDisable(true)}
            className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <ShieldOff className="h-4 w-4" /> Disable MFA
          </Button>
        </motion.div>
      )}

      {/* Step: Verify with QR code */}
      {step === "verify" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
            <p className="text-sm font-semibold">
              Scan this QR code with your authenticator app
            </p>
            {qrCodeUrl ? (
              <div className="mx-auto mt-4 flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="MFA QR Code"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <Skeleton className="mx-auto mt-4 h-48 w-48 rounded-xl" />
            )}
            {secret && (
              <div className="mt-4 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Or enter this key manually
                </p>
                <p className="font-mono text-xs text-foreground">{secret}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Verification Code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className="text-center text-lg font-semibold tracking-[0.5em] tabular-nums"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="cta"
              disabled={verificationCode.length < 6 || mfaConfirm.isPending}
            >
              {mfaConfirm.isPending ? "Verifying..." : "Verify & Enable"}
            </Button>
          </form>
        </motion.div>
      )}

      {/* Step: Backup codes */}
      {step === "backup" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="rounded-2xl border border-success/20 bg-success/5 p-4 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-success" />
            <p className="mt-2 text-sm font-semibold text-success">
              MFA Enabled Successfully
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Backup Codes</p>
              <button
                onClick={copyAllCodes}
                className="text-xs font-medium text-primary"
              >
                Copy All
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Save these codes in a safe place. You can use them to sign in if
              you lose access to your authenticator app.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => copyCode(code, i)}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2 font-mono text-sm transition-colors hover:bg-muted"
                >
                  <span>{code}</span>
                  {copiedIndex === i ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <Button size="cta" onClick={() => setStep("idle")}>
            Done
          </Button>
        </motion.div>
      )}

      {/* Disable MFA confirmation */}
      <AnimatePresence>
        {confirmDisable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
          >
            <p className="text-sm font-medium">Disable MFA?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your current authenticator code to disable MFA.
            </p>
            <form onSubmit={handleDisable} className="mt-3 space-y-3">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) =>
                  setDisableCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
                className="text-center font-semibold tracking-[0.5em] tabular-nums"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConfirmDisable(false);
                    setDisableCode("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  disabled={disableCode.length < 6 || mfaDisable.isPending}
                  className="flex-1"
                >
                  {mfaDisable.isPending ? "Disabling..." : "Disable"}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
