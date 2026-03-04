"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/providers/auth-store";
import { api } from "@/lib/api-client";
import type { TokenResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, router, redirect]);

  const formValid = identifier.trim().length >= 3 && password.length >= 8;

  async function handleLogin() {
    if (isSubmitting || !formValid) return;
    setError("");
    setIsSubmitting(true);
    try {
      const resp = await api.post<TokenResponse>("/v1/auth/login", {
        identifier: identifier.trim(),
        password,
      });
      login(resp.accessToken, resp.refreshToken, resp.user.id);
      router.replace(redirect);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("invalid")) {
        setError("Invalid username/phone or password");
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[72dvh] flex-col">
      <motion.div
        className="mb-9 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <ShieldCheck className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Neo</h1>
        <p className="text-sm text-muted-foreground">
          Ethiopian Digital Banking
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-5">
          <div className="text-center">
            <h2 className="text-xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your username or phone number
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Username or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="h-13 rounded-[10px] pl-11 text-base"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-13 rounded-[10px] pl-11 text-base"
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formValid && !isSubmitting) {
                    handleLogin();
                  }
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="mt-7 space-y-3">
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

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary underline">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
