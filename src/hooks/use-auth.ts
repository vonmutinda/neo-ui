"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MFASetupResponse,
  ChangePasswordRequest,
} from "@/lib/types";

export function useForgotPassword() {
  return useMutation<void, Error, { phone: string }>({
    mutationFn: ({ phone }) =>
      api.post<void>("/v1/auth/forgot-password", {
        phoneNumber: { countryCode: "", number: phone },
      } satisfies ForgotPasswordRequest),
    onSuccess: () => {
      toast.success("Password reset email sent");
    },
    onError: (err) => {
      toast.error("Failed to send reset email", { description: err.message });
    },
  });
}

export function useResetPassword() {
  return useMutation<void, Error, { otp: string; newPassword: string }>({
    mutationFn: ({ otp, newPassword }) =>
      api.post<void>("/v1/auth/reset-password", {
        phoneNumber: { countryCode: "", number: "" },
        otp,
        newPassword,
      } satisfies ResetPasswordRequest),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (err) => {
      toast.error("Failed to reset password", { description: err.message });
    },
  });
}

export function useMFASetup() {
  return useMutation<MFASetupResponse, Error, void>({
    mutationFn: () => api.post<MFASetupResponse>("/v1/auth/mfa/setup", {}),
    onSuccess: () => {
      toast.success("MFA setup initiated");
    },
    onError: (err) => {
      toast.error("Failed to setup MFA", { description: err.message });
    },
  });
}

export function useMFAConfirm() {
  return useMutation<void, Error, { code: string }>({
    mutationFn: (req) => api.post<void>("/v1/auth/mfa/confirm", req),
    onSuccess: () => {
      toast.success("MFA enabled successfully");
    },
    onError: (err) => {
      toast.error("Failed to confirm MFA", { description: err.message });
    },
  });
}

export function useMFADisable() {
  return useMutation<void, Error, { code: string }>({
    mutationFn: (req) => api.post<void>("/v1/auth/mfa/disable", req),
    onSuccess: () => {
      toast.success("MFA disabled");
    },
    onError: (err) => {
      toast.error("Failed to disable MFA", { description: err.message });
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: (req) => api.post<void>("/v1/auth/change-password", req),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (err) => {
      toast.error("Failed to change password", { description: err.message });
    },
  });
}
