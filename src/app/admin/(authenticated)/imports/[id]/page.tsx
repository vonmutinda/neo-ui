"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useAdminImport,
  useAdminReviewImport,
} from "@/hooks/admin/use-admin-imports";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import type { SupportedCurrency } from "@/lib/types";

export default function AdminImportDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { data: imp, isLoading } = useAdminImport(id);
  const review = useAdminReviewImport();
  const [reason, setReason] = useState("");

  async function submit(status: "approved" | "rejected") {
    await review.mutateAsync({
      id,
      body: { status, reason: reason.trim() || undefined },
    });
  }

  if (isLoading || !imp) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/imports"
        className="text-sm text-primary hover:underline"
      >
        ← Back to imports
      </Link>
      <h1 className="text-2xl font-semibold">{imp.referenceNumber}</h1>
      <p className="text-sm text-muted-foreground">Status: {imp.status}</p>
      <div className="rounded-2xl border border-border bg-card p-4 text-sm space-y-2">
        <p>
          <span className="text-muted-foreground">Supplier:</span>{" "}
          {imp.supplierName} ({imp.supplierCountry})
        </p>
        <p>
          <span className="text-muted-foreground">Goods:</span>{" "}
          {imp.goodsDescription}
        </p>
        <p className="font-tabular">
          {formatMoney(
            imp.proformaAmountCents,
            imp.proformaCurrency as SupportedCurrency,
          )}
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Review note (optional)
        </label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for decision"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="default"
          disabled={review.isPending}
          onClick={() => submit("approved")}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          disabled={review.isPending}
          onClick={() => submit("rejected")}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
