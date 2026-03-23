"use client";

import { useAdminComplianceReport } from "@/hooks/admin/use-admin-rules";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompliancePage() {
  const { data: report, isLoading } = useAdminComplianceReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No compliance report data available
      </p>
    );
  }

  // Render report sections dynamically based on keys
  const sections = Object.entries(report).filter(
    ([key]) => key !== "generatedAt" && key !== "id",
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Compliance Report</h2>
        {report.generatedAt && (
          <span className="text-sm text-muted-foreground">
            Generated: {new Date(report.generatedAt).toLocaleString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <h3 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
              {key
                .replace(/([A-Z])/g, " $1")
                .replace(/_/g, " ")
                .trim()}
            </h3>
            {typeof value === "object" && value !== null ? (
              <div className="space-y-1">
                {Object.entries(value as Record<string, unknown>).map(
                  ([subKey, subValue]) => (
                    <div
                      key={subKey}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs capitalize text-muted-foreground">
                        {subKey
                          .replace(/([A-Z])/g, " $1")
                          .replace(/_/g, " ")
                          .trim()}
                      </span>
                      <span className="font-tabular text-sm font-semibold">
                        {typeof subValue === "number"
                          ? subValue.toLocaleString()
                          : String(subValue ?? "—")}
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="font-tabular text-2xl font-semibold">
                {typeof value === "number"
                  ? value.toLocaleString()
                  : String(value ?? "—")}
              </p>
            )}
          </div>
        ))}
      </div>

      {sections.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          Report is empty
        </p>
      )}
    </div>
  );
}
