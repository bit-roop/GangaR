"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip, ZoomControl } from "react-leaflet";
import { divIcon } from "leaflet";

import type {
  BiodiversityHabitatOverlay,
  BiodiversityLayerKey,
  BiodiversityMapCluster,
  BiodiversityMapData,
  BiodiversityMapMarker,
  BiodiversityMigrationPath
} from "@/types/biodiversity";

type BiodiversityMapProps = {
  data: BiodiversityMapData;
  activeSpeciesId: string;
};

type MapCssVars = CSSProperties & Record<`--${string}`, string>;

const initialLayers: Record<BiodiversityLayerKey, boolean> = {
  species: true,
  hotspots: true,
  habitats: true,
  migration: true,
  clusters: true
};

function habitatCentroid(overlay: BiodiversityHabitatOverlay) {
  const totals = overlay.coordinates.reduce(
    (acc, [longitude, latitude]) => ({
      latitude: acc.latitude + latitude,
      longitude: acc.longitude + longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: totals.latitude / overlay.coordinates.length,
    longitude: totals.longitude / overlay.coordinates.length
  };
}

function pathSignalPosition(path: BiodiversityMigrationPath) {
  const [longitude, latitude] = path.coordinates[Math.max(0, path.coordinates.length - 2)] ?? path.coordinates[0];
  return { latitude, longitude };
}

function speciesMarkerIcon(marker: BiodiversityMapMarker, active = false) {
  const image = marker.thumbnail
    ? `<span class="biodiversity-marker-image" style="background-image:url('${marker.thumbnail}')"></span>`
    : `<span class="biodiversity-marker-initial">${marker.label.slice(0, 2).toUpperCase()}</span>`;

  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="biodiversity-marker signal-${marker.signalStrength} ${active ? "active" : ""}" style="--marker-accent:${marker.accent}"><i></i>${image}</span>`,
    iconSize: [52, 52],
    iconAnchor: [26, 26]
  });
}

function habitatIcon(overlay: BiodiversityHabitatOverlay) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="biodiversity-habitat-node habitat-${overlay.icon}" style="--habitat-accent:${overlay.fill}"><i></i></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function clusterIcon(cluster: BiodiversityMapCluster) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="biodiversity-cluster-node" style="--cluster-accent:${cluster.accent}"><strong>${cluster.observationCount}</strong></span>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });
}

function routeIcon(path: BiodiversityMigrationPath) {
  return divIcon({
    className: "leaflet-div-icon-reset",
    html: `<span class="biodiversity-route-node intensity-${path.intensity}"><i></i></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
}

export function BiodiversityMap({ data, activeSpeciesId }: BiodiversityMapProps) {
  const [layers, setLayers] = useState(initialLayers);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [previewMarkerId, setPreviewMarkerId] = useState<string | null>(null);

  useEffect(() => {
    const defaultMarker = data.markers.find((marker) => marker.speciesId === activeSpeciesId)?.id ?? data.markers[0]?.id ?? null;
    setSelectedMarkerId(defaultMarker);
  }, [activeSpeciesId, data.markers]);

  const riverPositions = useMemo(
    () => data.riverPath.map(([longitude, latitude]) => [latitude, longitude] as [number, number]),
    [data.riverPath]
  );
  const previewMarker = data.markers.find((marker) => marker.id === (previewMarkerId ?? selectedMarkerId)) ?? data.markers[0];

  const toggleLayer = (layer: BiodiversityLayerKey) => {
    setLayers((current) => ({
      ...current,
      [layer]: !current[layer]
    }));
  };

  return (
    <div className="biodiversity-map-shell">
      <MapContainer
        center={[data.center.latitude, data.center.longitude]}
        zoom={data.center.zoom}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map biodiversity-map"
        maxZoom={12}
        minZoom={6}
        preferCanvas
      >
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          opacity={0.22}
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="topright" />
        <div className="biodiversity-map-wash" />

        <Polyline
          positions={riverPositions}
          pathOptions={{
            color: "#72d7f3",
            weight: 8,
            opacity: 0.92
          }}
        />
        <Polyline
          positions={riverPositions}
          pathOptions={{
            color: "#0b5c75",
            weight: 2,
            opacity: 0.72
          }}
        />

        {layers.hotspots
          ? data.hotspots.map((hotspot) => (
              <Polygon
                key={hotspot.id}
                positions={hotspot.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                pathOptions={{
                  color: hotspot.severity === "critical" ? "#ffb25c" : hotspot.severity === "watch" ? "#e3d75a" : "#7bf0a5",
                  fillColor: hotspot.severity === "critical" ? "#f36f45" : hotspot.severity === "watch" ? "#d7ca43" : "#44c978",
                  fillOpacity: hotspot.severity === "critical" ? 0.28 : 0.22,
                  weight: 2.2
                }}
              >
                <Tooltip sticky>{hotspot.name}</Tooltip>
                <Popup>
                  <strong>{hotspot.name}</strong>
                  <div>{hotspot.summary}</div>
                  <div>{hotspot.speciesCount} focal species detected</div>
                </Popup>
              </Polygon>
            ))
          : null}

        {layers.habitats
          ? data.habitatOverlays.map((overlay) => (
              <Polygon
                key={overlay.id}
                positions={overlay.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                pathOptions={{
                  color: overlay.fill,
                  fillColor: overlay.fill,
                  fillOpacity: 0.26,
                  dashArray: "7 5",
                  weight: 2
                }}
              >
                <Tooltip sticky>{overlay.name}</Tooltip>
                <Popup>
                  <strong>{overlay.name}</strong>
                  <div>{overlay.habitatType}</div>
                  <div>{overlay.condition}</div>
                </Popup>
              </Polygon>
            ))
          : null}

        {layers.habitats
          ? data.habitatOverlays.map((overlay) => {
              const center = habitatCentroid(overlay);
              return (
                <Marker key={`${overlay.id}-node`} position={[center.latitude, center.longitude]} icon={habitatIcon(overlay)}>
                  <Tooltip direction="top" offset={[0, -12]}>
                    {overlay.name}
                  </Tooltip>
                  <Popup>
                    <strong>{overlay.name}</strong>
                    <div>{overlay.condition}</div>
                    <div>{overlay.district}</div>
                  </Popup>
                </Marker>
              );
            })
          : null}

        {layers.migration
          ? data.migrationPaths.map((path) => {
              return (
                <Polyline
                  key={path.id}
                  positions={path.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])}
                  pathOptions={{
                    color: path.intensity === "high" ? "#9df5ff" : "#8ee6ff",
                    weight: path.intensity === "high" ? 4 : 3.2,
                    opacity: 0.9,
                    dashArray: "10 8"
                  }}
                >
                  <Tooltip sticky>{path.label}</Tooltip>
                  <Popup>
                    <strong>{path.label}</strong>
                    <div>{path.season}</div>
                    <div>{path.flow}</div>
                  </Popup>
                </Polyline>
              );
            })
          : null}

        {layers.migration
          ? data.migrationPaths.map((path) => {
              const routePosition = pathSignalPosition(path);
              return (
                <Marker key={`${path.id}-route-node`} position={[routePosition.latitude, routePosition.longitude]} icon={routeIcon(path)}>
                  <Tooltip direction="top" offset={[0, -10]}>
                    {path.flow}
                  </Tooltip>
                </Marker>
              );
            })
          : null}

        {layers.clusters
          ? data.clusters.map((cluster) => (
              <Circle
                key={cluster.id}
                center={[cluster.latitude, cluster.longitude]}
                radius={Math.max(8000, cluster.observationCount * 420)}
                pathOptions={{
                  color: cluster.accent,
                  fillColor: cluster.accent,
                  fillOpacity: 0.18,
                  opacity: 0.64,
                  weight: 1.5
                }}
              >
                <Tooltip sticky>{cluster.signal}</Tooltip>
                <Popup>
                  <strong>{cluster.label}</strong>
                  <div>{cluster.signal}</div>
                </Popup>
              </Circle>
            ))
          : null}

        {layers.clusters
          ? data.clusters.map((cluster) => (
              <Marker key={`${cluster.id}-node`} position={[cluster.latitude, cluster.longitude]} icon={clusterIcon(cluster)}>
                <Tooltip direction="top" offset={[0, -12]}>
                  {cluster.signal}
                </Tooltip>
              </Marker>
            ))
          : null}

        {layers.species
          ? data.markers.map((marker) => (
              <CircleMarker
                key={`${marker.id}-signal`}
                center={[marker.latitude, marker.longitude]}
                radius={marker.signalStrength === "high" ? 24 : marker.signalStrength === "moderate" ? 19 : 15}
                pathOptions={{
                  color: marker.accent,
                  fillColor: marker.accent,
                  fillOpacity: 0.08,
                  opacity: 0.42,
                  weight: 1.4
                }}
              />
            ))
          : null}

        {layers.species
          ? data.markers.map((marker) => {
              const isActive = marker.speciesId === activeSpeciesId || marker.id === selectedMarkerId;
              return (
                <Marker
                  key={marker.id}
                  position={[marker.latitude, marker.longitude]}
                  icon={speciesMarkerIcon(marker, isActive)}
                  eventHandlers={{
                    click: () => setSelectedMarkerId(marker.id),
                    mouseover: () => setPreviewMarkerId(marker.id),
                    mouseout: () => setPreviewMarkerId(null)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -18]}>
                    {marker.label}
                  </Tooltip>
                  <Popup>
                    <strong>{marker.label}</strong>
                    <div>{marker.activityState}</div>
                    <div>{marker.habitatZone}</div>
                  </Popup>
                </Marker>
              );
            })
          : null}

        {previewMarker ? (
          <div className="biodiversity-observation-preview" style={{ "--preview-accent": previewMarker.accent } as MapCssVars}>
            <div className="biodiversity-preview-media">
              {previewMarker.thumbnail ? <span style={{ backgroundImage: `url(${previewMarker.thumbnail})` }} /> : <strong>{previewMarker.label.slice(0, 2).toUpperCase()}</strong>}
            </div>
            <div>
              <span>{previewMarker.district} observation</span>
              <strong>{previewMarker.label}</strong>
              <em>{previewMarker.scientificName}</em>
              <p>{previewMarker.activityState}</p>
              <div className="biodiversity-preview-meta">
                <i>{previewMarker.conservationStatus}</i>
                <i>{previewMarker.signalStrength} signal</i>
              </div>
            </div>
          </div>
        ) : null}

        <div className="biodiversity-map-controls">
          {(
            [
              ["species", "Species"],
              ["hotspots", "Hotspots"],
              ["habitats", "Habitats"],
              ["migration", "Migration"],
              ["clusters", "Clusters"]
            ] as Array<[BiodiversityLayerKey, string]>
          ).map(([layer, label]) => (
            <button
              key={layer}
              type="button"
              className={`biodiversity-layer-toggle ${layers[layer] ? "active" : ""}`}
              onClick={() => toggleLayer(layer)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="biodiversity-map-legend">
          <div className="legend-header">
            <strong>Ecosystem layers</strong>
            <span>Updated {data.legendTimestamp}</span>
          </div>
          <span><i className="legend-swatch legend-bio" /> Species markers and live observations</span>
          <span><i className="legend-swatch legend-watch" /> Watch hotspots and habitat pressure</span>
          <span><i className="legend-swatch legend-severe" /> Critical conservation zone</span>
          <span><i className="legend-swatch legend-river" /> Main river stem and movement corridor</span>
        </div>
      </MapContainer>
    </div>
  );
}
