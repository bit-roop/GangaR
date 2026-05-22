"use client";

import dynamic from "next/dynamic";

import type { BiodiversityMapData } from "@/types/biodiversity";

const BiodiversityMap = dynamic(
  () => import("@/components/biodiversity/BiodiversityMap").then((module) => module.BiodiversityMap),
  {
    ssr: false,
    loading: () => (
      <div className="map-fallback operational-map-loading biodiversity-map-fallback">
        <div className="map-grid" />
        <div className="risk-zone risk-zone-one" />
        <div className="risk-zone risk-zone-two" />
        <div className="river-line" />
        <div className="pin">
          <span className="pin-badge">•</span>
          Loading biodiversity surface
        </div>
        <span className="map-label map-label-one">Habitat overlays</span>
        <span className="map-label map-label-two">Syncing species markers and migration paths...</span>
      </div>
    )
  }
);

type ClientBiodiversityMapProps = {
  data: BiodiversityMapData;
  activeSpeciesId: string;
};

export function ClientBiodiversityMap({ data, activeSpeciesId }: ClientBiodiversityMapProps) {
  return <BiodiversityMap data={data} activeSpeciesId={activeSpeciesId} />;
}
