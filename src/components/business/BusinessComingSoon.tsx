"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

type BusinessComingSoonProps = {
  pathSegment: string;
};

export function BusinessComingSoon({ pathSegment }: BusinessComingSoonProps) {
  return (
    <div>
      <PageHeader title="Coming soon" />
      <p className="mt-2 text-sm text-muted-foreground">
        This area is not available yet.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Path:{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {pathSegment}
        </code>
      </p>
      <Link
        href="/business"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to business dashboard
      </Link>
    </div>
  );
}
