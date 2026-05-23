"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { ExplorerRegion, ExplorerTelemetryPoint } from "@/components/map-explorer/types";
import { ecosystemDistrictContexts } from "@/data/mock";
import { getBoundedTooltipOffset } from "@/lib/utils/chartTooltip";

const ExplorerMap = dynamic(
  () => import("@/components/map-explorer/ExplorerMap").then((module) => module.ExplorerMap),
  {
    ssr: false,
    loading: () => <div className="map-explorer-loading">Synchronizing ecosystem intelligence layers...</div>
  }
);

const layers = ["Flood", "Biodiversity", "Water Quality", "Incidents", "Migration", "Protected Zones"] as const;
const mapModes = ["Satellite", "Terrain", "Intelligence"] as const;

const regions: ExplorerRegion[] = ecosystemDistrictContexts.map((context) => ({
  id: context.id,
  name: context.name,
  district: context.district,
  status: context.status,
  coordinates: context.coordinates,
  tone: context.tone === "critical" ? "watch" : context.tone,
  wqi: context.wqi,
  floodRisk: context.floodRisk,
  dolphinActivity: context.biodiversityActivity,
  sediment: context.sediment,
  insight: context.insight,
  signals: context.signals
}));

const telemetry: ExplorerTelemetryPoint[] = [
  { label: "Mon", movement: 38, flood: 28, quality: 68, reports: 12 },
  { label: "Tue", movement: 42, flood: 34, quality: 70, reports: 15 },
  { label: "Wed", movement: 47, flood: 39, quality: 72, reports: 18 },
  { label: "Thu", movement: 51, flood: 37, quality: 71, reports: 16 },
  { label: "Fri", movement: 58, flood: 43, quality: 74, reports: 21 }
];

type TooltipPayloadItem = {
  payload: ExplorerTelemetryPoint;
  dataKey?: keyof ExplorerTelemetryPoint;
  value?: number;
};

function ExplorerTooltip({
  active,
  payload,
  coordinate,
  viewBox
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  coordinate?: { x?: number; y?: number };
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const tooltipWidth = 146;
  const tooltipHeight = 66;
  const position = getBoundedTooltipOffset({
    coordinate,
    viewBox,
    width: tooltipWidth,
    height: tooltipHeight,
    padding: 6,
    gap: 10
  });

  return (
    <div
      className={`map-explorer-tooltip ${position.edgeX} ${position.edgeY}`}
      style={{
        left: position.left,
        top: position.top
      }}
    >
      <span>{point.label}</span>
      <strong>Movement {point.movement}%</strong>
      <p>Flood {point.flood}% · WQI {point.quality} · Reports {point.reports}</p>
    </div>
  );
}

const MiniChart = memo(function MiniChart({ title, value, detail, dataKey, color, variant }: {
  title: string;
  value: string;
  detail: string;
  dataKey: keyof Pick<ExplorerTelemetryPoint, "movement" | "flood" | "quality" | "reports">;
  color: string;
  variant: "line" | "area";
}) {
  return (
    <article className="map-explorer-stat-card">
      <div className="map-explorer-stat-head">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <div className="map-explorer-chart-shell">
        <ResponsiveContainer width="100%" height={88}>
          {variant === "area" ? (
            <AreaChart data={telemetry} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={`${String(dataKey)}Fill`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(16, 33, 28, 0.06)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7f78", fontSize: 10 }} />
              <YAxis hide domain={["dataMin - 8", "dataMax + 8"]} />
              <Tooltip content={<ExplorerTooltip />} wrapperStyle={{ outline: "none", pointerEvents: "none", overflow: "visible", zIndex: 30 }} allowEscapeViewBox={{ x: true, y: true }} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.6} fill={`url(#${String(dataKey)}Fill)`} />
            </AreaChart>
          ) : (
            <LineChart data={telemetry} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid stroke="rgba(16, 33, 28, 0.06)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#6b7f78", fontSize: 10 }} />
              <YAxis hide domain={["dataMin - 8", "dataMax + 8"]} />
              <Tooltip content={<ExplorerTooltip />} wrapperStyle={{ outline: "none", pointerEvents: "none", overflow: "visible", zIndex: 30 }} allowEscapeViewBox={{ x: true, y: true }} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.8} dot={{ r: 3, fill: color, stroke: "#f8fbf9", strokeWidth: 2 }} activeDot={{ r: 5 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <p>{detail}</p>
    </article>
  );
});

export function MapExplorerWorkspace() {
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["Flood", "Biodiversity", "Water Quality", "Migration", "Protected Zones"]));
  const [mode, setMode] = useState<(typeof mapModes)[number]>("Satellite");
  const [selectedRegionId, setSelectedRegionId] = useState(regions[0].id);
  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId) ?? regions[0],
    [selectedRegionId]
  );

  const selectedContext = useMemo(
    () => ecosystemDistrictContexts.find((context) => context.id === selectedRegion.id),
    [selectedRegion.id]
  );

  const toggleLayer = useCallback((layer: string) => {
    setActiveLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  return (
    <section className="map-explorer-workspace">
      <section className="map-explorer-toolbar">
        <label className="map-explorer-search">
          <span>Search</span>
          <input type="search" placeholder="Search district, habitat, wetland, ghat..." />
        </label>

        <div className="map-explorer-layer-pills" aria-label="Explorer layers">
          {layers.map((layer) => (
            <button
              key={layer}
              type="button"
              className={`map-explorer-pill ${activeLayers.has(layer) ? "active" : ""}`}
              onClick={() => toggleLayer(layer)}
            >
              {layer}
            </button>
          ))}
        </div>

        <div className="map-explorer-toolbar-right">
          <span className="map-explorer-live-chip">6 active ecosystem signals</span>
          <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} aria-label="Map mode">
            {mapModes.map((item, index) => (
              <option key={`${item}-${index}`} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="map-explorer-main">
        <article className="map-explorer-map-card">
          <ExplorerMap
            activeLayers={activeLayers}
            mode={mode}
            regions={regions}
            selectedRegionId={selectedRegion.id}
            onRegionSelect={setSelectedRegionId}
          />
        </article>

        <aside className="map-explorer-context-panel">
          <div className="map-explorer-panel-head">
            <span>Selected Region</span>
            <h2>{selectedRegion.name}</h2>
            <p>{selectedRegion.status}</p>
          </div>

          <div className="map-explorer-quick-grid">
            <div><span>WQI</span><strong>{selectedRegion.wqi}</strong></div>
            <div><span>Flood Risk</span><strong>{selectedRegion.floodRisk}</strong></div>
            <div><span>Biodiversity</span><strong>{selectedRegion.dolphinActivity}</strong></div>
            <div><span>Sediment</span><strong>{selectedRegion.sediment}</strong></div>
          </div>

          <div className="map-explorer-signal-list">
            <span>Recent Signals</span>
            {selectedRegion.signals.map((signal) => (
              <p key={signal}><i />{signal}</p>
            ))}
          </div>

          <div className="map-explorer-ai-card">
            <span>AI Insight</span>
            <p>“{selectedRegion.insight}”</p>
          </div>

          <div className="map-explorer-signal-list">
            <span>Linked operations</span>
            <p><i />{selectedContext?.relatedReports ?? 0} report records connected</p>
            <p><i />{selectedContext?.confidence ?? 78}% multi-source confidence</p>
          </div>
        </aside>
      </section>

      <section className="map-explorer-telemetry-strip">
        <MiniChart title="Biodiversity movement" value="+18%" detail="Movement confidence improving through active corridors." dataKey="movement" color="#1f9f99" variant="line" />
        <MiniChart title="Flood spread probability" value="43%" detail="Moderate spread signal near low floodplain edges." dataKey="flood" color="#2ca7d0" variant="area" />
        <MiniChart title="Water quality change" value="+6" detail="WQI trend remains in recovery band this week." dataKey="quality" color="#52b788" variant="line" />
        <MiniChart title="Citizen report density" value="21" detail="Verified reports cluster around two monitored ghats." dataKey="reports" color="#d39a35" variant="area" />
      </section>
    </section>
  );
}
