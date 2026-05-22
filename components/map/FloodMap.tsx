"use client";

import { useMemo } from "react";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { useShallow } from "zustand/shallow";

import { useOperationalContext } from "@/lib/state/useOperationalContext";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { LayerTogglePanel } from "@/components/dashboard/LayerTogglePanel";
import { MapFocusController } from "@/components/map/MapFocusController";
import { MapInteractionController } from "@/components/map/MapInteractionController";
import type { FloodMapData } from "@/types/dashboard";

type FloodMapProps = {
  data: FloodMapData;
};

function createMarkerIcon(category: "flood" | "biodiversity" | "incident" = "flood") {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="map-marker map-marker-${category}">${category === "biodiversity" ? "🐬" : category === "incident" ? "!" : "📍"}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
}

function getZoneStyle(riskLevel: "watch" | "moderate" | "severe") {
  if (riskLevel === "severe") {
    return { fillColor: "#cc4b4b", color: "#a63b3b" };
  }

  if (riskLevel === "moderate") {
    return { fillColor: "#d88a32", color: "#bc7424" };
  }

  return { fillColor: "#d9bb46", color: "#ba9f2d" };
}

export function FloodMap({ data }: FloodMapProps) {
  const { activeDistrictName, selection, operationalIncidents } = useOperationalContext();
  const { layers, focusDistrict, selectFloodZone, selectMapMarker } = useOperationalStore(
    useShallow((state) => ({
      layers: state.layers,
      focusDistrict: state.focusDistrict,
      selectFloodZone: state.selectFloodZone,
      selectMapMarker: state.selectMapMarker
    }))
  );
  const riverPositions = useMemo(
    () => data.riverPath.map(([longitude, latitude]) => [latitude, longitude] as [number, number]),
    [data.riverPath]
  );
  const zonePositions = useMemo(
    () =>
      data.zones.map((zone) => ({
        ...zone,
        positions: zone.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])
      })),
    [data.zones]
  );
  const incidentMarkers = useMemo(
    () =>
      operationalIncidents.map((incident) => ({
        id: `incident-${incident.id}`,
        name: incident.title,
        latitude: incident.coordinates.latitude,
        longitude: incident.coordinates.longitude,
        district: incident.district,
        category: "incident" as const,
        detail: `${incident.category} • ${incident.verificationStatus} • ${incident.analystSeverity ?? incident.severity}`
      })),
    [operationalIncidents]
  );
  const bounds = useMemo(() => latLngBounds(riverPositions), [riverPositions]);
  const selectedLabel = data.districtLabels.find((label) => label.name === activeDistrictName);

  return (
    <div className="flood-map-container">
      <MapContainer
        center={[data.center.latitude, data.center.longitude]}
        zoom={data.center.zoom}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map"
        maxZoom={12}
        minZoom={6}
        dragging
        touchZoom
        maxBounds={bounds.pad(0.6)}
        preferCanvas
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <MapInteractionController />
        <MapFocusController latitude={selectedLabel?.latitude} longitude={selectedLabel?.longitude} />

        {layers.flood
          ? zonePositions.map((zone) => {
              const style = getZoneStyle(zone.riskLevel);
              const isSelected = activeDistrictName === zone.district || selection.selectedFloodZone === zone.id;
              return (
                <Polygon
                  key={zone.id}
                  positions={zone.positions}
                  pathOptions={{
                    fillColor: style.fillColor,
                    color: style.color,
                    fillOpacity: isSelected ? 0.22 : 0.12,
                    weight: isSelected ? 2.1 : 1,
                    opacity: isSelected ? 0.92 : 0.74
                  }}
                  eventHandlers={{
                    click: () => {
                      selectFloodZone(zone.id, zone.district, "map");
                    }
                  }}
                >
                  <Tooltip sticky direction="top">
                    {zone.district} • {zone.riskLevel} • {zone.confidence ?? 0}% confidence
                  </Tooltip>
                  <Popup>
                    <strong>{zone.district}: {zone.riskLevel.toUpperCase()} flood risk</strong>
                    <div>{zone.rainfallDriver}</div>
                    <div>Updated {zone.updatedAt}</div>
                  </Popup>
                </Polygon>
              );
            })
          : null}

        <Polyline
          positions={riverPositions}
          pathOptions={{
            color: "#2f80ed",
            weight: 5,
            opacity: 0.9
          }}
        />

        {[...data.markers, ...incidentMarkers]
          .filter((marker) => {
            if (marker.category === "biodiversity") return layers.biodiversity;
            return layers.flood;
          })
          .map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createMarkerIcon(marker.category)}
              eventHandlers={{
                click: () =>
                  marker.district
                    ? selectMapMarker(marker.id, marker.district, {
                        biodiversityEntity: marker.category === "biodiversity" ? marker.name : null,
                        source: "map"
                      })
                    : undefined
              }}
            >
              <Tooltip direction="top" offset={[0, -18]}>
                {marker.name}
              </Tooltip>
              <Popup>
                <strong>{marker.name}</strong>
                {marker.detail ? <div>{marker.detail}</div> : null}
              </Popup>
            </Marker>
          ))}

        {layers.districtLabels
          ? data.districtLabels.map((label) => (
              <Marker
                key={label.name}
                position={[label.latitude, label.longitude]}
                icon={divIcon({
                  className: "leaflet-div-icon-reset",
                  html: `<span class="district-label ${activeDistrictName === label.name ? "selected" : ""}">${label.name}</span>`
                })}
                eventHandlers={{
                  click: () => focusDistrict(label.name, "map")
                }}
              />
            ))
          : null}

        <LayerTogglePanel />

        <div className="map-legend">
          <div className="legend-header">
            <strong>Operational Layers</strong>
            <span>Updated {data.legendTimestamp}</span>
          </div>
          <span><i className="legend-swatch legend-severe" /> Severe Flood Risk</span>
          <span><i className="legend-swatch legend-moderate" /> Moderate Risk</span>
          <span><i className="legend-swatch legend-watch" /> Watch Zone</span>
          <span><i className="legend-swatch legend-river" /> River Flow: Ganga main stem</span>
          <span><i className="legend-swatch legend-bio" /> Habitat Zone / biodiversity markers</span>
        </div>
      </MapContainer>
    </div>
  );
}
