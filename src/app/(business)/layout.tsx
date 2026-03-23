"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { UserProfileLoader } from "@/providers/UserProfileLoader";

export default function BusinessSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserProfileLoader>{children}</UserProfileLoader>
    </AuthGuard>
  );
}
