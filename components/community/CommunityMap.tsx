"use client";

import { Circle, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";

import type { CommunityRegion } from "@/components/community/types";

type CommunityMapProps = {
  regions: CommunityRegion[];
  selectedRegionId: string;
  onRegionSelect: (regionId: string) => void;
};

const riverPath: Array<[number, number]> = [
  [25.69, 85.21],
  [25.62, 85.44],
  [25.46, 86.04],
  [25.37, 86.47],
  [25.25, 87.02],
  [25.21, 87.42]
];

const cleanupZones = [
  [
    [25.56, 85.05],
    [25.7, 85.18],
    [25.61, 85.38],
    [25.48, 85.22]
  ] as Array<[number, number]>,
  [
    [25.18, 86.82],
    [25.32, 86.98],
    [25.23, 87.22],
    [25.06, 87.08]
  ] as Array<[number, number]>
];

function regionIcon(tone: CommunityRegion["tone"], active: boolean) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="community-map-marker ${tone} ${active ? "active" : ""}"><i></i></span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19]
  });
}

function toneColor(tone: CommunityRegion["tone"]) {
  if (tone === "flood") return "#66d7f0";
  if (tone === "watch") return "#e1b85a";
  if (tone === "biodiversity") return "#53d5a5";
  return "#2bbf91";
}

export function CommunityMap({ regions, selectedRegionId, onRegionSelect }: CommunityMapProps) {
  return (
    <div className="community-map-shell">
      <MapContainer
        center={[25.42, 86.16]}
        zoom={8}
        minZoom={7}
        maxZoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map community-map"
        preferCanvas
      >
        <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          opacity={0.26}
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <div className="community-map-wash" />

        <Polyline positions={riverPath} pathOptions={{ color: "#bdf7ff", weight: 13, opacity: 0.34 }} />
        <Polyline positions={riverPath} pathOptions={{ color: "#0d8da0", weight: 4.6, opacity: 0.78 }} />

        {cleanupZones.map((zone, index) => (
          <Polygon
            key={`cleanup-${index}`}
            positions={zone}
            pathOptions={{ color: "#72d69d", fillColor: "#72d69d", fillOpacity: 0.14, opacity: 0.62, weight: 1.4, dashArray: "8 7" }}
          />
        ))}

        {regions.map((region) => (
          <Circle
            key={`${region.id}-density`}
            center={region.coordinates}
            radius={region.id === selectedRegionId ? 22000 : 15000}
            pathOptions={{
              color: toneColor(region.tone),
              fillColor: toneColor(region.tone),
              fillOpacity: region.id === selectedRegionId ? 0.16 : 0.08,
              opacity: 0.34,
              weight: 1.2
            }}
          />
        ))}

        {regions.map((region) => (
          <Marker
            key={region.id}
            position={region.coordinates}
            icon={regionIcon(region.tone, region.id === selectedRegionId)}
            eventHandlers={{ click: () => onRegionSelect(region.id) }}
          >
            <Tooltip direction="top" offset={[0, -14]} sticky>
              {region.name} • {region.participants} participants
            </Tooltip>
            <Popup>
              <strong>{region.name}</strong>
              <div>{region.district}</div>
              <div>{region.summary}</div>
            </Popup>
          </Marker>
        ))}

        <div className="community-map-legend">
          <span><i className="cleanup" /> Cleanup zones</span>
          <span><i className="biodiversity" /> Observations</span>
          <span><i className="flood" /> Preparedness</span>
        </div>
      </MapContainer>
    </div>
  );
}
