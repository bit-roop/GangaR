"use client";

import dynamic from "next/dynamic";

import type { FloodOperationsMapData } from "@/types/flood";

const FloodOperationsMap = dynamic(
  () => import("@/components/flood/FloodOperationsMap").then((module) => module.FloodOperationsMap),
  {
    ssr: false,
    loading: () => <div className="flood-operations-map-loading">Synchronizing hydrological layers...</div>
  }
);

type ClientFloodOperationsMapProps = {
  data: FloodOperationsMapData;
};

export function ClientFloodOperationsMap({ data }: ClientFloodOperationsMapProps) {
  return <FloodOperationsMap data={data} />;
}
