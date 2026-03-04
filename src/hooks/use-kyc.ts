"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { KYCOTPRequest, KYCVerifyRequest, KYCResponse } from "@/lib/types";

export function useRequestKYCOTP() {
  return useMutation<KYCResponse, Error, KYCOTPRequest>({
    mutationFn: (req) => api.post<KYCResponse>("/v1/kyc/otp", req),
  });
}

export function useVerifyKYC() {
  return useMutation<KYCResponse, Error, KYCVerifyRequest>({
    mutationFn: (req) => api.post<KYCResponse>("/v1/kyc/verify", req),
  });
}
