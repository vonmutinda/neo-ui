"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/providers/auth-store";
import { useEffect } from "react";

interface UserProfile {
  id: string;
  phoneNumber: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  kycLevel?: number;
  ledgerWalletId?: string;
  createdAt?: string;
}

export function useCurrentUser() {
  const { userId, isAuthenticated, setUserProfile } = useAuthStore();

  const query = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: () => apiClient<UserProfile>("/v1/me"),
    enabled: isAuthenticated && !!userId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setUserProfile({
        id: query.data.id,
        phoneNumber: query.data.phoneNumber,
        username: query.data.username,
        firstName: query.data.firstName,
        lastName: query.data.lastName,
        kycLevel: query.data.kycLevel,
      });
    }
  }, [query.data, setUserProfile]);

  return query;
}
