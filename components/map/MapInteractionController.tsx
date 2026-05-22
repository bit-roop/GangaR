"use client";

import { useEffect } from "react";
import { DomEvent } from "leaflet";
import { useMap } from "react-leaflet";

export function MapInteractionController() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    container.style.touchAction = "none";
    container.style.overscrollBehavior = "contain";

    DomEvent.disableScrollPropagation(container);
    DomEvent.disableClickPropagation(container);

    const stopWheelPropagation = (event: WheelEvent) => {
      event.stopPropagation();
    };

    container.addEventListener("wheel", stopWheelPropagation, { passive: true });

    return () => {
      container.removeEventListener("wheel", stopWheelPropagation);
    };
  }, [map]);

  return null;
}
