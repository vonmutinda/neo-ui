"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAdminMoneyFlowMap } from "@/hooks/admin/use-admin-money-flow-map";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Map } from "lucide-react";

const MoneyFlowGlobe = dynamic(
  () => import("@/components/admin/MoneyFlowGlobe").then((m) => m.MoneyFlowGlobe),
  { ssr: false, loading: () => <Skeleton className="h-[560px] w-full rounded-2xl" /> }
);

const MoneyFlowMap = dynamic(
  () => import("@/components/admin/MoneyFlowMap").then((m) => m.MoneyFlowMap),
  { ssr: false, loading: () => <Skeleton className="h-[560px] w-full rounded-2xl" /> }
);

function dateToString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type ViewMode = "globe" | "map";

export default function AdminMapPage() {
  const defaultFrom = dateToString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const defaultTo = dateToString(new Date());
  const [fromInput, setFromInput] = useState(defaultFrom);
  const [toInput, setToInput] = useState(defaultTo);
  const [applied, setApplied] = useState({ from: defaultFrom, to: defaultTo });
  const [viewMode, setViewMode] = useState<ViewMode>("globe");

  const { data, isLoading, isFetching, isError, error } = useAdminMoneyFlowMap({
    from: applied.from,
    to: applied.to,
    limit: 500,
  });

  const points = data?.points ?? [];
  const flows = data?.flows ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">From</span>
          <Input
            type="date"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
            className="h-9 w-40"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">To</span>
          <Input
            type="date"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className="h-9 w-40"
          />
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setApplied({ from: fromInput, to: toInput })}
          disabled={isLoading || isFetching}
        >
          {isFetching ? "Loading…" : "Apply"}
        </Button>
        <div className="flex rounded-lg border border-border bg-muted/50 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("globe")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "globe" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-4 w-4" />
            Globe
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "map" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {points.length} point(s)
          {flows.length > 0 && `, ${flows.length} flow(s)`}
        </span>
      </div>

      {isError && (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error?.message ?? "Failed to load money flow data. Check that the API is running and GEOIP_DB_PATH is set."}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[560px] w-full rounded-2xl" />
      ) : viewMode === "globe" ? (
        <MoneyFlowGlobe points={points} flows={flows} className="h-[560px] w-full rounded-2xl overflow-hidden bg-muted/30" />
      ) : (
        <MoneyFlowMap points={points} flows={flows} className="h-[560px] w-full rounded-2xl" />
      )}

      {!isLoading && !isError && points.length === 0 && flows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No money flow data in this date range. Locations are derived from the last known session IP per user. Ensure users have logged in and transactions exist in the selected period.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Money movement by location (session IP). No raw IPs are shown. Requires backend GEOIP_DB_PATH and MaxMind GeoLite2-City.
      </p>
    </div>
  );
}
