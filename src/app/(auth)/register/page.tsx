"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  Lock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useAuthStore } from "@/providers/auth-store";
import { EnviarLogo } from "@/components/shared/EnviarLogo";
import { api } from "@/lib/api-client";
import { registerSchema } from "@/lib/schemas";
import { useFormErrors } from "@/hooks/use-form-errors";
import type { TokenResponse } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formData = { phone, username, password, confirmPassword };
  const {
    errors: fieldErrors,
    validate,
    clearField,
  } = useFormErrors(registerSchema, formData);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  function formatPhoneDisplay(raw: string) {
    const d = raw.replace(/\D/g, "");
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }

  function handlePhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, 9));
  }

  const usernameValid = username.length >= 3 && username.length <= 30;
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  async function handleRegister() {
    if (isSubmitting) return;
    if (!validate()) return;
    setError("");
    setIsSubmitting(true);
    try {
      const resp = await api.post<TokenResponse>("/v1/auth/register", {
        phoneNumber: { countryCode: "251", number: phone },
        username: username.trim().toLowerCase(),
        password,
      });
      if (!resp?.accessToken || !resp?.refreshToken || !resp?.user?.id) {
        setError("Invalid response from server");
        return;
      }
      login(resp.accessToken, resp.refreshToken, resp.user.id);
      router.replace("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.includes("username")) {
        setError("Username is already taken");
      } else if (msg.includes("phone") || msg.includes("conflict")) {
        setError("Phone number is already registered");
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="mb-6 flex flex-col items-center gap-3">
        <EnviarLogo size="lg" />
        <p className="text-xs text-muted-foreground">Create your account</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-3">
          {/* Phone */}
          <FormField label="Phone number" error={fieldErrors.phone}>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                <span className="text-muted-foreground">+251</span>
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="9XX XXX XXXX"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => {
                  handlePhoneChange(e.target.value);
                  clearField("phone");
                }}
                className="h-12 rounded-xl border border-border/60 bg-card pl-14 text-base"
                autoFocus
                aria-required="true"
              />
              <Phone className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
            </div>
          </FormField>

          {/* Username */}
          <FormField label="Username" error={fieldErrors.username}>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/\s/g, ""));
                  clearField("username");
                }}
                className="h-12 rounded-xl border border-border/60 bg-card pl-10 pr-12 text-base"
                autoComplete="username"
                maxLength={30}
                aria-required="true"
              />
              {username.length > 0 && (
                <span
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs ${usernameValid ? "text-primary/80" : "text-muted-foreground"}`}
                >
                  {username.length}/30
                </span>
              )}
            </div>
          </FormField>

          {/* Password */}
          <FormField label="Password" error={fieldErrors.password}>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearField("password");
                }}
                className="h-12 rounded-xl border border-border/60 bg-card pl-10 pr-10 text-base"
                autoComplete="new-password"
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-primary/60 hover:bg-muted hover:text-primary"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormField>

          {/* Confirm Password */}
          <FormField
            label="Confirm password"
            error={fieldErrors.confirmPassword}
          >
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearField("confirmPassword");
                }}
                className="h-12 rounded-xl border border-border/60 bg-card pl-10 text-base"
                autoComplete="new-password"
                aria-required="true"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSubmitting) {
                    handleRegister();
                  }
                }}
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-destructive">
                  Mismatch
                </span>
              )}
            </div>
          </FormField>

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

        <div className="mt-5 space-y-3">
          <Button
            size="lg"
            disabled={isSubmitting}
            onClick={handleRegister}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
