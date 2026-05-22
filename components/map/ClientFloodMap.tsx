"use client";

import dynamic from "next/dynamic";

import type { FloodMapData } from "@/types/dashboard";

const FloodMap = dynamic(
  () => import("@/components/map/FloodMap").then((module) => module.FloodMap),
  {
    ssr: false,
    loading: () => (
      <div className="map-fallback operational-map-loading">
        <div className="map-grid" />
        <div className="risk-zone risk-zone-one" />
        <div className="risk-zone risk-zone-two" />
        <div className="river-line" />
        <div className="pin">
          <span className="pin-badge">📍</span>
          Patna
        </div>
        <span className="map-label map-label-one">Patna</span>
        <span className="map-label map-label-two">Loading flood map...</span>
      </div>
    )
  }
);

type ClientFloodMapProps = {
  data: FloodMapData;
};

export function ClientFloodMap({ data }: ClientFloodMapProps) {
  return <FloodMap data={data} />;
}
