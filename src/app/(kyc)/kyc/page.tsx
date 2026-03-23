"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuccessAnimation } from "@/components/shared/SuccessAnimation";
import { useRequestKYCOTP, useVerifyKYC } from "@/hooks/use-kyc";

type Step = "intro" | "fayda-id" | "otp" | "verifying" | "done";

const STEP_INDEX: Record<Step, number> = {
  intro: 0,
  "fayda-id": 1,
  otp: 2,
  verifying: 3,
  done: 4,
};

const OTP_LENGTH = 6;

export default function KYCPage() {
  const router = useRouter();

  const requestOTP = useRequestKYCOTP();
  const verify = useVerifyKYC();

  const [step, setStep] = useState<Step>("intro");
  const [faydaId, setFaydaId] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const progress = ((STEP_INDEX[step] + 1) / 5) * 100;

  async function handleRequestOTP() {
    setError("");
    try {
      await requestOTP.mutateAsync({ faydaId });
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    }
  }

  const handleVerify = useCallback(
    async (code: string) => {
      setError("");
      setStep("verifying");
      try {
        const res = await verify.mutateAsync({ faydaId, otp: code });
        if (res.status === "verified") {
          setStep("done");
        } else {
          setError("Verification failed. Please try again.");
          setStep("otp");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
        setStep("otp");
      }
    },
    [faydaId, verify],
  );

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const code = next.join("");
    if (code.length === OTP_LENGTH && next.every(Boolean)) {
      handleVerify(code);
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (step !== "done") return;
    setShowCelebration(true); // eslint-disable-line react-hooks/set-state-in-effect -- intentional animation trigger
    const timeout = window.setTimeout(() => setShowCelebration(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [step]);

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      <SuccessAnimation
        show={showCelebration}
        title="Identity verified"
        subtitle="Your account is now ready for higher-trust features."
      />

      {/* Header */}
      <h1 className="text-xl font-semibold text-foreground">
        Identity Verification
      </h1>

      {/* Progress bar */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-primary/20">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Step content */}
      <div className="flex flex-1 flex-col pt-8">
        <AnimatePresence mode="wait">
          {/* Intro */}
          {step === "intro" && (
            <motion.div
              key="intro"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Verify with Fayda
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    We use Ethiopia&apos;s National Digital ID to verify your
                    identity. This unlocks higher transaction limits and full
                    account features.
                  </p>
                </div>
                <div className="w-full space-y-3 rounded-2xl border border-border/60 bg-card p-4 text-left text-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      1
                    </span>
                    <span>Enter your Fayda ID number</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      2
                    </span>
                    <span>Receive a one-time verification code</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      3
                    </span>
                    <span>Enter the code to complete verification</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={() => setStep("fayda-id")}
                className="mt-6 h-14 text-base font-semibold rounded-xl border border-primary bg-primary text-primary-foreground hover:opacity-90"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Fayda ID input */}
          {step === "fayda-id" && (
            <motion.div
              key="fayda-id"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Fingerprint className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    Enter Fayda ID
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your 12-digit National Digital ID number
                  </p>
                </div>

                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000 000 000 000"
                  value={faydaId}
                  onChange={(e) =>
                    setFaydaId(
                      e.target.value.replace(/[^\d]/g, "").slice(0, 12),
                    )
                  }
                  className="h-14 text-center text-xl tracking-widest"
                  autoFocus
                />

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setStep("intro")}
                  className="h-14 flex-1 rounded-xl border border-primary text-primary hover:bg-primary/10"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  disabled={faydaId.length < 12 || requestOTP.isPending}
                  onClick={handleRequestOTP}
                  className="h-14 flex-1 text-base font-semibold rounded-xl border border-primary bg-primary text-primary-foreground hover:opacity-90"
                >
                  {requestOTP.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Send Code
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* OTP input */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col items-center gap-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">
                    Enter Verification Code
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A 6-digit code was sent to your registered number
                  </p>
                </div>

                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-12 rounded-xl border border-border/60 bg-card text-center text-xl font-bold outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  onClick={handleRequestOTP}
                  disabled={requestOTP.isPending}
                  className="text-sm font-medium text-primary"
                >
                  {requestOTP.isPending ? "Sending..." : "Resend code"}
                </button>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setOtp(Array(OTP_LENGTH).fill(""));
                  setStep("fayda-id");
                }}
                className="mt-6 h-14 rounded-xl border border-primary text-primary hover:bg-primary/10"
              >
                Back
              </Button>
            </motion.div>
          )}

          {/* Verifying spinner */}
          {step === "verifying" && (
            <motion.div
              key="verifying"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col items-center justify-center gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                Verifying your identity...
              </p>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div
              key="done"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <CheckCircle2 className="h-20 w-20 text-success" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground">
                  Verified!
                </h2>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Your identity has been verified. You now have access to higher
                  transaction limits and full account features.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => router.push("/")}
                className="mt-6 h-14 text-base font-semibold rounded-xl border border-primary bg-primary text-primary-foreground hover:opacity-90"
              >
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
