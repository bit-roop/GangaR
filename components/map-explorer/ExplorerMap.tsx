"use client";

import { Circle, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";

import type { ExplorerRegion } from "@/components/map-explorer/types";

type ExplorerMapProps = {
  regions: ExplorerRegion[];
  selectedRegionId: string;
  activeLayers: Set<string>;
  mode: "Satellite" | "Terrain" | "Intelligence";
  onRegionSelect: (regionId: string) => void;
};

const riverPath: Array<[number, number]> = [
  [25.69, 85.21],
  [25.56, 85.55],
  [25.45, 86.05],
  [25.37, 86.47],
  [25.25, 87.02],
  [25.21, 87.42]
];

const migrationPath: Array<[number, number]> = [
  [25.18, 86.18],
  [25.28, 86.45],
  [25.25, 86.78],
  [25.25, 87.02],
  [25.3, 87.26]
];

const floodZones = [
  [
    [25.47, 86.32],
    [25.58, 86.58],
    [25.43, 86.86],
    [25.23, 86.72],
    [25.27, 86.42]
  ] as Array<[number, number]>,
  [
    [25.12, 86.86],
    [25.3, 87.06],
    [25.18, 87.34],
    [25.02, 87.12]
  ] as Array<[number, number]>
];

const wetlands = [
  [
    [25.2, 86.88],
    [25.38, 86.96],
    [25.32, 87.18],
    [25.12, 87.14]
  ] as Array<[number, number]>,
  [
    [25.62, 85.05],
    [25.76, 85.22],
    [25.62, 85.44],
    [25.5, 85.24]
  ] as Array<[number, number]>
];

const incidentPins = [
  { id: "ghat-report", label: "Verified ghat report", position: [25.59, 85.18] as [number, number], tone: "incident" },
  { id: "fishing-pressure", label: "Fishing pressure reduced", position: [25.29, 86.88] as [number, number], tone: "watch" },
  { id: "citizen-sighting", label: "Citizen sighting verified", position: [25.23, 87.05] as [number, number], tone: "stable" }
];

function hotspotIcon(tone: ExplorerRegion["tone"], active: boolean) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="map-explorer-hotspot ${tone} ${active ? "active" : ""}"><i></i></span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

function incidentIcon(tone: string) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="map-explorer-incident-pin ${tone}">•</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
}

export function ExplorerMap({ regions, selectedRegionId, activeLayers, mode, onRegionSelect }: ExplorerMapProps) {
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? regions[0];
  const show = (layer: string) => activeLayers.has(layer);
  const labelOpacity = mode === "Satellite" ? 0.24 : mode === "Terrain" ? 0.46 : 0.32;
  const tileFilterClass = `mode-${mode.toLowerCase()}`;

  return (
    <div className={`map-explorer-map-shell ${tileFilterClass}`}>
      <MapContainer
        center={[25.34, 86.45]}
        zoom={8}
        minZoom={7}
        maxZoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map map-explorer-map"
        preferCanvas
      >
        <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          opacity={labelOpacity}
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <div className="map-explorer-map-wash" />

        <Polyline positions={riverPath} pathOptions={{ color: "#bdf7ff", weight: 15, opacity: 0.34 }} />
        <Polyline positions={riverPath} pathOptions={{ color: "#0d8da0", weight: 5, opacity: 0.8 }} />

        {show("Flood")
          ? floodZones.map((zone, index) => (
              <Polygon
                key={`flood-${index}`}
                positions={zone}
                pathOptions={{ color: "#66d7f0", fillColor: "#66d7f0", fillOpacity: 0.12, opacity: 0.58, weight: 1.5 }}
              />
            ))
          : null}

        {show("Protected Zones")
          ? wetlands.map((zone, index) => (
              <Polygon
                key={`wetland-${index}`}
                positions={zone}
                pathOptions={{ color: "#72d69d", fillColor: "#72d69d", fillOpacity: 0.15, opacity: 0.66, weight: 1.4, dashArray: "8 7" }}
              />
            ))
          : null}

        {show("Migration") ? (
          <>
            <Polyline className="map-explorer-route-glow" positions={migrationPath} pathOptions={{ color: "#d7fff7", weight: 8, opacity: 0.18 }} />
            <Polyline className="map-explorer-route-line" positions={migrationPath} pathOptions={{ color: "#7ee7d5", weight: 3, opacity: 0.9, dashArray: "8 12" }} />
          </>
        ) : null}

        {show("Biodiversity")
          ? regions.map((region) => (
              <Circle
                key={`${region.id}-hotspot`}
                center={region.coordinates}
                radius={region.id === selectedRegionId ? 22000 : 16000}
                pathOptions={{
                  color: region.tone === "stable" ? "#53d5a5" : "#e1b85a",
                  fillColor: region.tone === "stable" ? "#53d5a5" : "#e1b85a",
                  fillOpacity: region.id === selectedRegionId ? 0.16 : 0.08,
                  opacity: 0.36,
                  weight: 1.2
                }}
              />
            ))
          : null}

        {regions.map((region) => (
          <Marker
            key={region.id}
            position={region.coordinates}
            icon={hotspotIcon(region.tone, region.id === selectedRegionId)}
            eventHandlers={{ click: () => onRegionSelect(region.id) }}
          >
            <Tooltip direction="top" offset={[0, -16]} sticky>
              {region.name} · WQI {region.wqi}
            </Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <div>{region.status}</div>
              <div>Flood risk {region.floodRisk} · Dolphin activity {region.dolphinActivity}</div>
            </Popup>
          </Marker>
        ))}

        {show("Incidents")
          ? incidentPins.map((pin) => (
              <Marker key={pin.id} position={pin.position} icon={incidentIcon(pin.tone)}>
                <Tooltip direction="top" offset={[0, -10]}>{pin.label}</Tooltip>
              </Marker>
            ))
          : null}

        {show("Water Quality") ? (
          <div className="map-explorer-map-chip">
            <span>Water quality</span>
            <strong>{selectedRegion.name}: WQI {selectedRegion.wqi}</strong>
          </div>
        ) : null}
      </MapContainer>
    </div>
  );
}
