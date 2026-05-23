"use client";

import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";

type SensorStation = {
  id: string;
  name: string;
  stretch: string;
  status: "safe" | "watch" | "unsafe";
  coordinates: { latitude: number; longitude: number };
  wqi: number;
  oxygen: number;
  ph: number;
  turbidity: number;
  recovery: string;
  habitat: string;
};

type RiverHealthMapProps = {
  stations: SensorStation[];
  activeStationId: string;
  onStationSelect: (stationId: string) => void;
  statusLabel: (status: SensorStation["status"]) => string;
};

const riverPath: Array<[number, number]> = [
  [30.1, 78.28],
  [29.94, 78.16],
  [29.37, 78.14],
  [28.98, 78.32],
  [28.37, 79.42],
  [27.88, 79.91],
  [26.93, 80.12],
  [26.45, 80.33],
  [26.08, 80.72],
  [25.72, 81.24],
  [25.44, 81.85],
  [25.32, 82.26],
  [25.32, 82.97],
  [25.58, 83.58],
  [25.6, 84.05]
];

const flowSegments = [
  riverPath.slice(0, 5),
  riverPath.slice(4, 9),
  riverPath.slice(8, 13),
  riverPath.slice(11)
];

const ecologyMarkers = [
  { label: "Dolphin movement corridor", position: [25.34, 82.62] as [number, number], icon: "◦" },
  { label: "Riparian recovery patch", position: [30.0, 78.21] as [number, number], icon: "↟" },
  { label: "Confluence bird activity", position: [25.42, 81.88] as [number, number], icon: "⌁" }
];

function stationIcon(status: SensorStation["status"], active: boolean) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="river-leaflet-marker ${status} ${active ? "active" : ""}"><i></i></span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function ecologyIcon(icon: string) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="river-ecology-marker">${icon}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

function statusColor(status: SensorStation["status"]) {
  if (status === "safe") return "#53d5a5";
  if (status === "watch") return "#e1b85a";
  return "#e47d67";
}

export function RiverHealthMap({ stations, activeStationId, onStationSelect, statusLabel }: RiverHealthMapProps) {
  const activeStation = stations.find((station) => station.id === activeStationId) ?? stations[0];

  return (
    <div className="river-map-shell">
      <MapContainer
        center={[26.35, 81.15]}
        zoom={7}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map river-health-map"
        maxZoom={12}
        minZoom={6}
        preferCanvas
      >
        <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          opacity={0.24}
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <div className="river-map-atmosphere" />

        <Polyline positions={riverPath} pathOptions={{ color: "#bdf7ff", weight: 13, opacity: 0.54 }} />
        <Polyline positions={riverPath} pathOptions={{ color: "#0d8da0", weight: 5, opacity: 0.86 }} />
        <Polyline positions={riverPath} pathOptions={{ color: "#7ee7d5", weight: 2, opacity: 0.86, dashArray: "10 14" }} />

        {flowSegments.map((segment, index) => (
          <Polyline
            key={segment[0].join("-")}
            className={`river-current-line current-${index + 1}`}
            positions={segment}
            pathOptions={{ color: "#d7fff7", weight: 2.4, opacity: 0.76, dashArray: "3 18" }}
          />
        ))}

        {stations.map((station, index) => {
          const next = stations[index + 1];
          const stretchPositions = next
            ? [
                [station.coordinates.latitude, station.coordinates.longitude] as [number, number],
                [next.coordinates.latitude, next.coordinates.longitude] as [number, number]
              ]
            : [
                [station.coordinates.latitude, station.coordinates.longitude] as [number, number],
                [25.58, 83.58] as [number, number]
              ];

          return (
            <Polyline
              key={`${station.id}-stretch`}
              positions={stretchPositions}
              pathOptions={{
                color: statusColor(station.status),
                weight: station.id === activeStationId ? 20 : 15,
                opacity: station.id === activeStationId ? 0.24 : 0.14,
                lineCap: "round"
              }}
            />
          );
        })}

        {stations.map((station) => (
          <Circle
            key={`${station.id}-zone`}
            center={[station.coordinates.latitude, station.coordinates.longitude]}
            radius={station.status === "unsafe" ? 18000 : 13000}
            pathOptions={{
              color: statusColor(station.status),
              fillColor: statusColor(station.status),
              fillOpacity: station.id === activeStationId ? 0.18 : 0.08,
              opacity: station.id === activeStationId ? 0.5 : 0.24,
              weight: 1.2
            }}
          />
        ))}

        {ecologyMarkers.map((marker) => (
          <Marker key={marker.label} position={marker.position} icon={ecologyIcon(marker.icon)}>
            <Tooltip direction="top" offset={[0, -10]}>{marker.label}</Tooltip>
          </Marker>
        ))}

        {stations.map((station) => (
          <Marker
            eventHandlers={{ click: () => onStationSelect(station.id) }}
            icon={stationIcon(station.status, station.id === activeStationId)}
            key={station.id}
            position={[station.coordinates.latitude, station.coordinates.longitude]}
          >
            <Tooltip direction="top" offset={[0, -14]} sticky>
              {station.name} · {statusLabel(station.status)} · WQI {station.wqi}
            </Tooltip>
            <Popup>
              <strong>{station.name}</strong>
              <div>{station.stretch}</div>
              <div>DO {station.oxygen} mg/L · pH {station.ph} · Turbidity {station.turbidity} NTU</div>
            </Popup>
          </Marker>
        ))}

        <div className="river-map-card">
          <span>Selected station</span>
          <strong>{activeStation.name}</strong>
          <p>{activeStation.recovery}</p>
        </div>

        <div className="river-map-legend">
          <span><i className="safe" /> Safe stretch</span>
          <span><i className="watch" /> Watch</span>
          <span><i className="unsafe" /> Unsafe</span>
        </div>
      </MapContainer>
    </div>
  );
}
