"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { adminApi } from "@/lib/admin-api-client";
import type { AdminLoginResponse } from "@/lib/admin-types";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((s) => s.login);
  const token = useAdminAuthStore((s) => s.token);
  const staff = useAdminAuthStore((s) => s.staff);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token && staff) router.replace("/admin");
  }, [token, staff, router]);

  const formValid = email.includes("@") && password.length >= 6;

  async function handleLogin() {
    if (isSubmitting || !formValid) return;
    setError("");
    setIsSubmitting(true);
    try {
      const resp = await adminApi.post<AdminLoginResponse>("/auth/login", {
        email,
        password,
      });
      login(resp.token, resp.staff);
      router.replace("/admin");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (
        msg.includes("401") ||
        msg.includes("invalid") ||
        msg.includes("Invalid")
      ) {
        setError("Invalid email or password");
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 md:p-8">
        <motion.div
          className="mb-8 flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EnviarLogo size="lg" />
          <p className="text-sm text-muted-foreground">
            Admin · Bank Operations Dashboard
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <div className="text-center">
            <h2 className="text-xl font-bold">Staff Login</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your staff email
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="staff@enviar.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-[10px] pl-11 text-base"
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-[10px] pl-11 text-base"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formValid && !isSubmitting)
                    handleLogin();
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <Button
            size="lg"
            disabled={!formValid || isSubmitting}
            onClick={handleLogin}
            className="h-14 w-full rounded-[10px] text-base font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
