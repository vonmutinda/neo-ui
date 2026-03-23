"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();

  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    try {
      await forgotPassword.mutateAsync({ phone: phone.trim() });
      toast.success("OTP sent to your phone");
      router.push("/reset-password");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
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
          <Phone className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your phone number and we&apos;ll send you a verification code.
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-2">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Phone Number
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251 9XX XXX XXX"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          size="cta"
          disabled={!phone.trim() || forgotPassword.isPending}
          className="gap-2"
        >
          {forgotPassword.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              Send OTP <ArrowRight className="h-4 w-4" />
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
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}
