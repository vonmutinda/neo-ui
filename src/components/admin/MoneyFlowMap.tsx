"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import type { MoneyFlowPoint, MoneyFlowFlow } from "@/lib/admin-types";
import { formatMoney } from "@/lib/format";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER: [number, number] = [9.145, 40.4897]; // Ethiopia
const DEFAULT_ZOOM = 6;

function FitBounds({
  points,
  flows,
}: {
  points: MoneyFlowPoint[];
  flows: MoneyFlowFlow[];
}) {
  const map = useMap();
  useEffect(() => {
    const all: [number, number][] = [
      ...points.map((p) => [p.lat, p.lon] as [number, number]),
      ...flows.flatMap((f) => [
        [f.from.lat, f.from.lon] as [number, number],
        [f.to.lat, f.to.lon] as [number, number],
      ]),
    ];
    if (all.length === 0) return;
    if (all.length === 1) {
      map.setView(all[0], 10);
      return;
    }
    map.fitBounds(all as L.LatLngBoundsLiteral, {
      padding: [40, 40],
      maxZoom: 12,
    });
  }, [map, points, flows]);
  return null;
}

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MoneyFlowMap({
  points,
  flows,
  className = "h-[500px] w-full rounded-2xl",
}: {
  points: MoneyFlowPoint[];
  flows: MoneyFlowFlow[];
  className?: string;
}) {
  const hasData = points.length > 0 || flows.length > 0;

  return (
    <div className={className}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full rounded-2xl z-0"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasData && <FitBounds points={points} flows={flows} />}
        {points.map((p) => (
          <Marker
            key={p.transactionId}
            position={[p.lat, p.lon]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {formatMoney(p.amountCents, p.currency)}
                </p>
                <p className="text-muted-foreground capitalize">
                  {p.type.replace(/_/g, " ")}
                </p>
                {(p.city || p.country) && (
                  <p className="text-xs text-muted-foreground">
                    {[p.city, p.country].filter(Boolean).join(", ")}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {p.createdAt.slice(0, 10)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        {flows.map((f, i) => (
          <Polyline
            key={`${f.from.lat},${f.from.lon}-${f.to.lat},${f.to.lon}`}
            positions={[
              [f.from.lat, f.from.lon],
              [f.to.lat, f.to.lon],
            ]}
            pathOptions={{ color: "#A07D20", weight: 2, opacity: 0.7 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
