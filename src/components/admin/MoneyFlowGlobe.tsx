"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GlobeMethods } from "react-globe.gl";
import type { MoneyFlowPoint, MoneyFlowFlow } from "@/lib/admin-types";
import { formatMoney } from "@/lib/format";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const GLOBE_IMAGE =
  "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const BumpImage =
  "https://unpkg.com/three-globe/example/img/earth-topology.png";
const BACKGROUND_IMAGE =
  "https://unpkg.com/three-globe/example/img/night-sky.png";

// THREE.js cannot resolve CSS custom properties — hex values derived from the
// Electric Violet palette in globals.css to keep them in sync.
const PALETTE = {
  primary: "#A07D20",
  primaryDim: "#CDB050",
  transfer: "#34D399",
  card: "#A07D20",
  loan: "#E07850",
  neutral: "#9CA3AF",
} as const;

function pointColorByType(type: string | undefined): string {
  if (!type) return PALETTE.neutral;
  if (type.startsWith("p2p")) return PALETTE.transfer;
  if (type.startsWith("card")) return PALETTE.card;
  if (type.includes("loan") || type.includes("disburse")) return PALETTE.loan;
  return PALETTE.neutral;
}

function pointRadiusByAmount(amountCents: number): number {
  if (!amountCents || amountCents <= 0) return 0.2;
  const min = Math.log1p(100);
  const max = Math.log1p(1_000_000_00);
  const val = Math.log1p(amountCents);
  const clamped = Math.min(Math.max(val, min), max);
  return 0.2 + ((clamped - min) / (max - min)) * 0.8;
}

type PointData = MoneyFlowPoint & { id: string };
type ArcData = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  amountCents: number;
  currency: string;
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pointsData: PointData[] = points.map((p) => ({
    ...p,
    id: p.transactionId,
  }));
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
      const first = points[0] ?? {
        lat: flows[0].from.lat,
        lon: flows[0].from.lon,
      };
      g.pointOfView({ lat: first.lat, lng: first.lon, altitude: 2 });
    }
  }, [points, flows]);

  const hasSize = dims.w > 0 && dims.h > 0;

  return (
    <div ref={containerRef} className={className}>
      {hasSize ? (
        <Globe
          ref={globeRef}
          width={dims.w}
          height={dims.h}
          globeImageUrl={GLOBE_IMAGE}
          bumpImageUrl={BumpImage}
          backgroundImageUrl={BACKGROUND_IMAGE}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lon"
          pointAltitude={0.01}
          pointRadius={(d) => pointRadiusByAmount((d as PointData).amountCents)}
          pointColor={(d) => pointColorByType((d as PointData).type)}
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
          arcColor={() => [PALETTE.primary, PALETTE.primaryDim]}
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
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          Loading…
        </div>
      )}
    </div>
  );
}
