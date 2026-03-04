"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import type { MoneyFlowPoint, MoneyFlowFlow } from "@/lib/admin-types";
import { formatMoney } from "@/lib/format";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const GLOBE_IMAGE = "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BumpImage = "//unpkg.com/three-globe/example/img/earth-topology.png";

type PointData = MoneyFlowPoint & { id: string };
type ArcData = { startLat: number; startLng: number; endLat: number; endLng: number; amountCents: number; currency: string };

export function MoneyFlowGlobe({
  points,
  flows,
  className = "h-[500px] w-full rounded-2xl bg-muted/30",
}: {
  points: MoneyFlowPoint[];
  flows: MoneyFlowFlow[];
  className?: string;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const pointsData: PointData[] = points.map((p) => ({ ...p, id: p.transactionId }));
  const arcsData: ArcData[] = flows.map((f) => ({
    startLat: f.from.lat,
    startLng: f.from.lon,
    endLat: f.to.lat,
    endLng: f.to.lon,
    amountCents: f.amountCents,
    currency: f.currency,
  }));

  useEffect(() => {
    const g = globeRef.current;
    if (g?.pointOfView && (points.length > 0 || flows.length > 0)) {
      const first = points[0] ?? { lat: flows[0].from.lat, lon: flows[0].from.lon };
      g.pointOfView({ lat: first.lat, lng: first.lon, altitude: 2 });
    }
  }, [points.length, flows.length, points[0], flows[0]]);

  return (
    <div className={className}>
      <Globe
        ref={globeRef}
        globeImageUrl={GLOBE_IMAGE}
        bumpImageUrl={BumpImage}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={pointsData}
        pointLat="lat"
        pointLng="lon"
        pointAltitude={0.01}
        pointRadius={0.4}
        pointColor={() => "hsl(var(--primary))"}
        pointLabel={(d) => {
          const p = d as PointData;
          return `
          <div class="rounded-lg border border-border bg-card p-2 text-sm shadow-lg min-w-[140px]">
            <p class="font-semibold">${formatMoney(p.amountCents, p.currency)}</p>
            <p class="text-muted-foreground capitalize">${(p.type ?? "").replace(/_/g, " ")}</p>
            ${p.city || p.country ? `<p class="text-xs text-muted-foreground">${[p.city, p.country].filter(Boolean).join(", ")}</p>` : ""}
            <p class="text-xs text-muted-foreground">${p.createdAt?.slice(0, 10) ?? ""}</p>
          </div>
        `;
        }}
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={() => ["hsl(var(--primary))", "hsl(var(--primary) / 0.6)"]}
        arcStroke={0.8}
        arcAltitude={0.25}
        arcAltitudeAutoScale={0.5}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcLabel={(d) => {
          const a = d as ArcData;
          return `
          <div class="rounded border border-border bg-card px-2 py-1 text-xs shadow">
            ${formatMoney(a.amountCents, a.currency)}
          </div>
        `;
        }}
      />
    </div>
  );
}
