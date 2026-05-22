"use client";

import { useShallow } from "zustand/shallow";

import { useOperationalStore } from "@/lib/state/useOperationalStore";

const layerDefinitions = [
  { key: "flood", label: "Flood layers" },
  { key: "biodiversity", label: "Biodiversity" },
  { key: "districtLabels", label: "District labels" }
] as const;

export function LayerTogglePanel() {
  const { layers, setLayerVisible } = useOperationalStore(
    useShallow((state) => ({
      layers: state.layers,
      setLayerVisible: state.setLayerVisible
    }))
  );

  return (
    <div className="map-controls">
      {layerDefinitions.map((layer) => (
        <button
          key={layer.key}
          type="button"
          className={`map-control-toggle ${layers[layer.key] ? "active" : ""}`}
          onClick={() => setLayerVisible(layer.key, !layers[layer.key])}
        >
          {layer.label}
        </button>
      ))}
    </div>
  );
}
