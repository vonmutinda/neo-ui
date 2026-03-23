"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/providers/admin-auth-store";
import { Loader2 } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAdminAuthStore((s) => s.token);
  const staff = useAdminAuthStore((s) => s.staff);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // eslint-disable-line react-hooks/set-state-in-effect -- SSR hydration guard
  }, []);

  useEffect(() => {
    if (hydrated && (!token || !staff)) {
      router.replace("/admin/login");
    }
  }, [hydrated, token, staff, router]);

  if (!hydrated || !token || !staff) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
