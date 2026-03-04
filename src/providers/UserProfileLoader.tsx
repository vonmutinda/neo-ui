"use client";

import { useCurrentUser } from "@/hooks/use-user";

export function UserProfileLoader({ children }: { children: React.ReactNode }) {
  useCurrentUser();
  return <>{children}</>;
}
