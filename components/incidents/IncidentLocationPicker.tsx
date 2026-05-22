"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";

type DistrictPoint = {
  district: string;
  latitude: number;
  longitude: number;
};

type IncidentLocationPickerProps = {
  districtPoints: DistrictPoint[];
  selectedDistrict: string;
  latitude: string;
  longitude: string;
  onSelect: (latitude: number, longitude: number) => void;
  onUseCurrentLocation: () => void;
};

const ClientIncidentLocationMap = dynamic(
  () => import("@/components/incidents/IncidentLocationMap").then((module) => module.IncidentLocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="incident-location-map-fallback">
        <div className="map-grid" />
        <div className="river-line" />
        <div className="pin">
          <span className="pin-badge">!</span>
          Loading map selection...
        </div>
      </div>
    )
  }
);

export function IncidentLocationPicker({
  districtPoints,
  selectedDistrict,
  latitude,
  longitude,
  onSelect,
  onUseCurrentLocation
}: IncidentLocationPickerProps) {
  const selectedLatitude = latitude ? Number(latitude) : null;
  const selectedLongitude = longitude ? Number(longitude) : null;

  const districtPoint = useMemo(
    () => districtPoints.find((point) => point.district === selectedDistrict) ?? districtPoints[0],
    [districtPoints, selectedDistrict]
  );

  useEffect(() => {
    if (!districtPoint) return;
    if (selectedLatitude !== null && selectedLongitude !== null) return;

    onSelect(districtPoint.latitude, districtPoint.longitude);
  }, [districtPoint, onSelect, selectedLatitude, selectedLongitude]);

  if (!districtPoint) return null;

  const previewLabel =
    selectedLatitude !== null && selectedLongitude !== null
      ? `${selectedLatitude.toFixed(4)} N, ${selectedLongitude.toFixed(4)} E`
      : "District-centered placement ready";

  return (
    <section className="incident-location-panel">
      <div className="incident-location-head">
        <div>
          <span className="incident-section-label">Location selection</span>
          <strong>Tap the map to place your report</strong>
        </div>
        <button type="button" className="incident-location-ghost" onClick={onUseCurrentLocation}>
          Use Current Location
        </button>
      </div>

      <ClientIncidentLocationMap
        districtPoints={districtPoints}
        selectedDistrict={selectedDistrict}
        selectedLatitude={selectedLatitude}
        selectedLongitude={selectedLongitude}
        onSelect={onSelect}
      />

      <div className="incident-location-preview">
        <div>
          <span className="incident-section-label">Selected area</span>
          <strong>{districtPoint.district} reporting point</strong>
        </div>
        <p>{previewLabel}</p>
      </div>
    </section>
  );
}
