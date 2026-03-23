"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessStore } from "@/providers/business-store";
import { useBusiness, useMyBusinesses } from "@/hooks/business/use-business";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function BusinessContextLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const {
    activeBusinessId,
    setActiveBusiness,
    setActiveBusinessId,
    clearBusiness,
    hydrate,
  } = useBusinessStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const {
    data: businesses,
    isLoading: bizListLoading,
    isError: mineListError,
  } = useMyBusinesses();

  useEffect(() => {
    if (!businesses?.length) return;
    if (!activeBusinessId) {
      setActiveBusinessId(businesses[0].id);
      return;
    }
    const exists = businesses.some((b) => b.id === activeBusinessId);
    if (!exists) {
      clearBusiness();
      setActiveBusinessId(businesses[0].id);
    }
  }, [businesses, activeBusinessId, setActiveBusinessId, clearBusiness]);

  const {
    data: business,
    isLoading: bizLoading,
    isError: bizError,
  } = useBusiness(activeBusinessId);

  useEffect(() => {
    if (business) {
      setActiveBusiness(business);
    }
  }, [business, setActiveBusiness]);

  useEffect(() => {
    if (bizListLoading) return;
    if (!businesses) return;
    if (businesses.length > 0) return;
    clearBusiness();
    router.replace("/business/create");
  }, [bizListLoading, businesses, clearBusiness, router]);

  useEffect(() => {
    if (!bizError || !businesses?.length || !activeBusinessId) return;
    const inList = businesses.some((b) => b.id === activeBusinessId);
    if (!inList) {
      clearBusiness();
      setActiveBusinessId(businesses[0].id);
    }
  }, [
    bizError,
    businesses,
    activeBusinessId,
    clearBusiness,
    setActiveBusinessId,
  ]);

  if (mineListError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-semibold">Couldn&apos;t load businesses</p>
        <p className="text-sm text-muted-foreground">Try again in a moment.</p>
      </div>
    );
  }

  if (bizListLoading) {
    return <LoadingSkeleton />;
  }

  if (businesses && businesses.length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectingFirst =
    businesses && businesses.length > 0 && !activeBusinessId;

  if (selectingFirst) {
    return <LoadingSkeleton />;
  }

  if (activeBusinessId && bizLoading && !business) {
    return <LoadingSkeleton />;
  }

  if (bizError && businesses && businesses.length > 0) {
    const inList = activeBusinessId
      ? businesses.some((b) => b.id === activeBusinessId)
      : false;
    if (!inList) {
      return <LoadingSkeleton />;
    }
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-lg font-semibold">
          Couldn&apos;t load this business
        </p>
        <p className="text-sm text-muted-foreground">Try again in a moment.</p>
      </div>
    );
  }

  return <>{children}</>;
}
