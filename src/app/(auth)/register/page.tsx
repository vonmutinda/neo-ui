"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Phone,
  User,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/providers/auth-store";
import { api } from "@/lib/api-client";
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

  const phoneValid = phone.length === 9;
  const usernameValid = username.length >= 3 && username.length <= 30;
  const passwordValid = password.length >= 8;
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const formValid =
    phoneValid && usernameValid && passwordValid && passwordsMatch;

  async function handleRegister() {
    if (isSubmitting || !formValid) return;
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
    <div className="flex min-h-[72dvh] flex-col">
      <motion.div
        className="mb-7 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-sm">
          <ShieldCheck className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Neo</h1>
        <p className="text-sm text-muted-foreground">Create your account</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-1 flex-col gap-4">
          {/* Phone */}
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              <span className="text-lg">🇪🇹</span>
              <span className="text-sm font-medium text-muted-foreground">
                +251
              </span>
            </div>
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="9XX XXX XXXX"
              value={formatPhoneDisplay(phone)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-13 rounded-[10px] pl-[5.5rem] text-base tracking-wide"
              autoFocus
            />
            <Phone className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Username */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              className="h-13 rounded-[10px] pl-11 text-base"
              autoComplete="username"
              maxLength={30}
            />
            {username.length > 0 && (
              <span
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${usernameValid ? "text-success" : "text-muted-foreground"}`}
              >
                {username.length}/30
              </span>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-13 rounded-[10px] pl-11 pr-11 text-base"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-13 rounded-[10px] pl-11 text-base"
              autoComplete="new-password"
              onKeyDown={(e) => {
                if (e.key === "Enter" && formValid && !isSubmitting) {
                  handleRegister();
                }
              }}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-destructive">
                Mismatch
              </span>
            )}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}
        </div>

        <div className="mt-7 space-y-3">
          <Button
            size="lg"
            disabled={!formValid || isSubmitting}
            onClick={handleRegister}
            className="h-14 w-full rounded-[10px] text-base font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline">
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
      </motion.div>
    </div>
  );
}
