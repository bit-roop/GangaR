"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

type MapFocusControllerProps = {
  latitude?: number;
  longitude?: number;
};

export function MapFocusController({ latitude, longitude }: MapFocusControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 8.7), {
      duration: 0.45
    });
  }, [latitude, longitude, map]);

  return null;
}
