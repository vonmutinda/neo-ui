"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetPassword = useResetPassword();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = password === confirmPassword;
  const isValid = otp.length >= 4 && password.length >= 8 && passwordsMatch;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    try {
      await resetPassword.mutateAsync({
        otp,
        newPassword: password,
      });
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to reset password",
      );
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center space-y-8 px-1">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the OTP sent to your phone and choose a new password.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* OTP */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Verification Code
          </label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="text-center text-lg font-semibold tracking-[0.5em] tabular-nums"
            autoFocus
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            New Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          size="cta"
          disabled={!isValid || resetPassword.isPending}
          className="gap-2"
        >
          {resetPassword.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Resetting...
            </>
          ) : (
            <>
              Reset Password <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-sm text-muted-foreground"
      >
        Didn&apos;t receive the code?{" "}
        <Link href="/forgot-password" className="font-medium text-primary">
          Resend
        </Link>
      </motion.p>
    </div>
  );
}
