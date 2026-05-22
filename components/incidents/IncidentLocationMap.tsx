"use client";

import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useMemo } from "react";

type DistrictPoint = {
  district: string;
  latitude: number;
  longitude: number;
};

type IncidentLocationMapProps = {
  districtPoints: DistrictPoint[];
  selectedDistrict: string;
  selectedLatitude: number | null;
  selectedLongitude: number | null;
  onSelect: (latitude: number, longitude: number) => void;
};

function MapCenterController({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 9), {
      animate: true,
      duration: 0.45
    });
  }, [latitude, longitude, map]);

  return null;
}

function ClickSelectionLayer({
  onSelect
}: {
  onSelect: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
}

const incidentPin = divIcon({
  className: "leaflet-div-icon-reset",
  html: '<span class="incident-picker-pin">!</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const districtPin = divIcon({
  className: "leaflet-div-icon-reset",
  html: '<span class="incident-picker-district-pin"></span>',
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export function IncidentLocationMap({
  districtPoints,
  selectedDistrict,
  selectedLatitude,
  selectedLongitude,
  onSelect
}: IncidentLocationMapProps) {
  const activeDistrictPoint =
    districtPoints.find((point) => point.district === selectedDistrict) ?? districtPoints[0];

  const markerPosition = useMemo(() => {
    if (selectedLatitude !== null && selectedLongitude !== null) {
      return [selectedLatitude, selectedLongitude] as [number, number];
    }

    return [activeDistrictPoint.latitude, activeDistrictPoint.longitude] as [number, number];
  }, [activeDistrictPoint.latitude, activeDistrictPoint.longitude, selectedLatitude, selectedLongitude]);

  return (
    <div className="incident-location-map-shell">
      <MapContainer
        center={[activeDistrictPoint.latitude, activeDistrictPoint.longitude]}
        zoom={9}
        scrollWheelZoom
        className="incident-location-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapCenterController latitude={activeDistrictPoint.latitude} longitude={activeDistrictPoint.longitude} />
        <ClickSelectionLayer onSelect={onSelect} />

        {districtPoints.map((point) => (
          <Marker key={point.district} position={[point.latitude, point.longitude]} icon={districtPin}>
            <Tooltip direction="top" offset={[0, -4]}>
              {point.district}
            </Tooltip>
          </Marker>
        ))}

        <Marker position={markerPosition} icon={incidentPin}>
          <Tooltip direction="top" offset={[0, -18]} permanent>
            Selected reporting point
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}
