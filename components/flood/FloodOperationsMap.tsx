"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Circle, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";

import type { FloodLayerKey, FloodOperationsMapData } from "@/types/flood";

type FloodOperationsMapProps = {
  data: FloodOperationsMapData;
};

const initialLayers: Record<FloodLayerKey, boolean> = {
  rainfall: true,
  districtRisk: true,
  floodSpread: true,
  embankments: false,
  riverIntensity: true,
  telemetry: false
};

function forecastIcon(kind: "district" | "upstream" | "downstream") {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="flood-forecast-node kind-${kind}">${kind === "upstream" ? "↑" : kind === "downstream" ? "↓" : "•"}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function riskColors(risk: "watch" | "moderate" | "severe") {
  if (risk === "severe") return { fill: "#f0694a", stroke: "#d95a40" };
  if (risk === "moderate") return { fill: "#f4a24f", stroke: "#dd8f3f" };
  return { fill: "#d8c55a", stroke: "#c1ad47" };
}

export function FloodOperationsMap({ data }: FloodOperationsMapProps) {
  const [layers, setLayers] = useState(initialLayers);

  const riverPositions = useMemo(
    () => data.riverPath.map(([longitude, latitude]) => [latitude, longitude] as [number, number]),
    [data.riverPath]
  );

  const toggleLayer = (layer: FloodLayerKey) => {
    setLayers((current) => ({
      ...current,
      [layer]: !current[layer]
    }));
  };

  return (
    <div className="flood-operations-map-shell">
      <MapContainer
        center={[data.center.latitude, data.center.longitude]}
        zoom={data.center.zoom}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map flood-operations-map"
        maxZoom={12}
        minZoom={6}
        preferCanvas
      >
        <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          opacity={0.18}
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <div className="flood-map-atmosphere" />

        {layers.rainfall
          ? data.rainCells.map((cell) => (
              <Circle
                key={cell.id}
                center={[cell.center[1], cell.center[0]]}
                radius={cell.radius}
                pathOptions={{
                  color: cell.intensity === "heavy" ? "#79d9ff" : cell.intensity === "moderate" ? "#99d7ff" : "#c6ecff",
                  fillColor: cell.intensity === "heavy" ? "#50c8ff" : cell.intensity === "moderate" ? "#7ed7ff" : "#d7f1ff",
                  fillOpacity: cell.intensity === "heavy" ? 0.18 : 0.12,
                  opacity: 0.45,
                  weight: 1.1
                }}
              >
                <Tooltip sticky>{cell.rainfallRate}</Tooltip>
              </Circle>
            ))
          : null}

        {layers.districtRisk
          ? data.districtGradients.map((gradient) => {
              const palette = riskColors(gradient.risk);
              return (
                <Polygon
                  key={gradient.id}
                  positions={gradient.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                  pathOptions={{ color: palette.stroke, fillColor: palette.fill, fillOpacity: 0.18, weight: 1.6, opacity: 0.88 }}
                >
                  <Tooltip sticky>{gradient.district} • {gradient.risk} • {gradient.confidence}% confidence</Tooltip>
                </Polygon>
              );
            })
          : null}

        {layers.floodSpread
          ? data.spreadZones.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                pathOptions={{
                  color: zone.phase === "active" ? "#8ee8ff" : zone.phase === "forecast" ? "#bfdfff" : "#8fd4c5",
                  fillColor: zone.phase === "active" ? "#76dfff" : zone.phase === "forecast" ? "#d7ecff" : "#97ddca",
                  fillOpacity: 0.12,
                  dashArray: zone.phase === "active" ? undefined : "7 6",
                  weight: 1.5
                }}
              >
                <Popup>
                  <strong>{zone.label}</strong>
                  <div>{zone.summary}</div>
                </Popup>
              </Polygon>
            ))
          : null}

        {layers.riverIntensity ? (
          <>
            <Polyline positions={riverPositions} pathOptions={{ color: "#7fe3ff", weight: 9, opacity: 0.88 }} />
            <Polyline positions={riverPositions} pathOptions={{ color: "#0d6f88", weight: 2.4, opacity: 0.8 }} />
          </>
        ) : null}

        {layers.embankments
          ? data.embankmentRegions.map((region) => (
              <Polygon
                key={region.id}
                positions={region.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                pathOptions={{
                  color: region.status === "critical" ? "#ffb197" : "#ffe29e",
                  fillColor: region.status === "critical" ? "#ffb197" : "#ffe29e",
                  fillOpacity: 0.08,
                  dashArray: "5 6",
                  weight: 1.2
                }}
              />
            ))
          : null}

        {data.forecastMarkers.map((marker) => (
          <Marker key={marker.id} position={[marker.latitude, marker.longitude]} icon={forecastIcon(marker.kind)}>
            <Tooltip direction="top" offset={[0, -12]}>{marker.label}</Tooltip>
            <Popup>
              <strong>{marker.label}</strong>
              <div>{marker.note}</div>
            </Popup>
          </Marker>
        ))}

        <div className="flood-map-controls">
          {([
            ["rainfall", "Rainfall"],
            ["districtRisk", "District risk"],
            ["floodSpread", "Spread zones"],
            ["riverIntensity", "River"],
            ["embankments", "Banks"]
          ] as Array<[FloodLayerKey, string]>).map(([layer, label]) => (
            <button key={layer} type="button" className={`flood-layer-toggle ${layers[layer] ? "active" : ""}`} onClick={() => toggleLayer(layer)}>
              {label}
            </button>
          ))}
        </div>

        <div className="flood-map-legend">
          <div className="legend-header">
            <strong>Map layers</strong>
            <span>Updated {data.legendTimestamp}</span>
          </div>
          <span><i className="legend-swatch legend-river" /> River and rainfall</span>
          <span><i className="legend-swatch legend-moderate" /> District risk areas</span>
          <span><i className="legend-swatch legend-severe" /> Flood spread zones</span>
        </div>
      </MapContainer>

      <motion.div className="flood-map-preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <span>Forecast highlight</span>
        <strong>Munger remains the most exposed district</strong>
        <p>Rain is building here first, with Bhagalpur likely to follow later in the day.</p>
      </motion.div>
    </div>
  );
}
