"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useAuthStore } from "@/providers/auth-store";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { api } from "@/lib/api-client";
import { loginSchema } from "@/lib/schemas";
import { useFormErrors } from "@/hooks/use-form-errors";
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

  const {
    errors: fieldErrors,
    validate,
    clearField,
  } = useFormErrors(loginSchema, { identifier, password });

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (isAuthenticated) router.replace(redirect);
  }, [isAuthenticated, router, redirect]);

  async function handleLogin() {
    if (isSubmitting) return;
    if (!validate()) return;
    setError("");
    setIsSubmitting(true);
    try {
      const resp = await api.post<TokenResponse>("/v1/auth/login", {
        identifier: identifier.trim(),
        password,
      });
      if (!resp?.accessToken || !resp?.refreshToken || !resp?.user?.id) {
        setError("Invalid response from server");
        return;
      }
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
    <div className="flex min-h-0 flex-col">
      <div className="mb-8 flex justify-center">
        <EnviarLogo size="lg" />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your username or phone number
            </p>
          </div>

          <div className="space-y-3">
            <FormField label="Username or phone" error={fieldErrors.identifier}>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                <Input
                  type="text"
                  placeholder="Username or phone number"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    clearField("identifier");
                  }}
                  className="h-12 rounded-xl border border-border/60 bg-card pl-10 text-base"
                  autoFocus
                  autoComplete="username"
                  aria-required="true"
                />
              </div>
            </FormField>

            <FormField label="Password" error={fieldErrors.password}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearField("password");
                  }}
                  className="h-12 rounded-xl border border-border/60 bg-card pl-10 text-base"
                  autoComplete="current-password"
                  aria-required="true"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      identifier.length >= 3 &&
                      password.length >= 1 &&
                      !isSubmitting
                    ) {
                      handleLogin();
                    }
                  }}
                />
              </div>
            </FormField>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-center text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            size="lg"
            disabled={
              !(identifier.length >= 3 && password.length >= 1) || isSubmitting
            }
            onClick={handleLogin}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
