"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
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

import { getBoundedTooltipOffset } from "@/lib/utils/chartTooltip";

const RiverHealthMap = dynamic(
  () => import("@/components/river-health/RiverHealthMap").then((module) => module.RiverHealthMap),
  {
    ssr: false,
    loading: () => <div className="river-map-loading">Synchronizing river telemetry layers...</div>
  }
);

type RiverPoint = {
  label: string;
  wqi: number;
  oxygen: number;
  ph: number;
  turbidity: number;
  note: string;
};

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
  series: RiverPoint[];
};

type TooltipPayloadItem = {
  payload: RiverPoint;
  dataKey?: string;
  value?: number;
};

const stations: SensorStation[] = [
  {
    id: "rishikesh",
    name: "Rishikesh Bend",
    stretch: "Upper Ganga oxygen refuge",
    status: "safe",
    coordinates: { latitude: 30.0869, longitude: 78.2676 },
    wqi: 88,
    oxygen: 8.4,
    ph: 7.3,
    turbidity: 12,
    recovery: "+14% native fish sightings",
    habitat: "Riparian shade improving",
    series: [
      { label: "06:00", wqi: 84, oxygen: 8.1, ph: 7.2, turbidity: 14, note: "Clean morning flow" },
      { label: "09:00", wqi: 86, oxygen: 8.3, ph: 7.3, turbidity: 12, note: "Stable dissolved oxygen" },
      { label: "12:00", wqi: 88, oxygen: 8.4, ph: 7.3, turbidity: 12, note: "Healthy macroinvertebrate signal" },
      { label: "15:00", wqi: 87, oxygen: 8.2, ph: 7.4, turbidity: 13, note: "Low sediment drift" },
      { label: "18:00", wqi: 89, oxygen: 8.5, ph: 7.3, turbidity: 11, note: "Evening recovery pulse" }
    ]
  },
  {
    id: "kanpur",
    name: "Kanpur Urban Edge",
    stretch: "Mixed-use recovery corridor",
    status: "watch",
    coordinates: { latitude: 26.4499, longitude: 80.3319 },
    wqi: 67,
    oxygen: 6.2,
    ph: 7.8,
    turbidity: 29,
    recovery: "+6% wetland vegetation cover",
    habitat: "Bank filtration under watch",
    series: [
      { label: "06:00", wqi: 70, oxygen: 6.5, ph: 7.6, turbidity: 24, note: "Moderate clarity" },
      { label: "09:00", wqi: 68, oxygen: 6.3, ph: 7.7, turbidity: 27, note: "Urban inflow visible" },
      { label: "12:00", wqi: 64, oxygen: 5.9, ph: 7.9, turbidity: 34, note: "Short turbidity lift" },
      { label: "15:00", wqi: 66, oxygen: 6.1, ph: 7.8, turbidity: 31, note: "Returning toward baseline" },
      { label: "18:00", wqi: 67, oxygen: 6.2, ph: 7.8, turbidity: 29, note: "Watch stretch remains stable" }
    ]
  },
  {
    id: "prayagraj",
    name: "Prayagraj Confluence",
    stretch: "Confluence mixing zone",
    status: "safe",
    coordinates: { latitude: 25.4358, longitude: 81.8463 },
    wqi: 78,
    oxygen: 7.1,
    ph: 7.5,
    turbidity: 20,
    recovery: "+9% bird activity index",
    habitat: "Sandbar nesting calm",
    series: [
      { label: "06:00", wqi: 75, oxygen: 6.9, ph: 7.4, turbidity: 22, note: "Confluence dilution rising" },
      { label: "09:00", wqi: 77, oxygen: 7.0, ph: 7.5, turbidity: 21, note: "Stable mixing signature" },
      { label: "12:00", wqi: 79, oxygen: 7.2, ph: 7.5, turbidity: 19, note: "Clearer center channel" },
      { label: "15:00", wqi: 78, oxygen: 7.1, ph: 7.5, turbidity: 20, note: "Balanced pH profile" },
      { label: "18:00", wqi: 80, oxygen: 7.2, ph: 7.4, turbidity: 18, note: "Good ecological margin" }
    ]
  },
  {
    id: "varanasi",
    name: "Varanasi Ghats",
    stretch: "High-pressure cultural reach",
    status: "unsafe",
    coordinates: { latitude: 25.3176, longitude: 82.9739 },
    wqi: 52,
    oxygen: 4.8,
    ph: 8.1,
    turbidity: 43,
    recovery: "+3% cleanup response impact",
    habitat: "Dolphin movement constrained",
    series: [
      { label: "06:00", wqi: 58, oxygen: 5.2, ph: 7.9, turbidity: 35, note: "Early flow acceptable" },
      { label: "09:00", wqi: 54, oxygen: 4.9, ph: 8.0, turbidity: 41, note: "Organic load rising" },
      { label: "12:00", wqi: 49, oxygen: 4.5, ph: 8.2, turbidity: 48, note: "Unsafe patch detected" },
      { label: "15:00", wqi: 51, oxygen: 4.7, ph: 8.1, turbidity: 45, note: "Recovery crews notified" },
      { label: "18:00", wqi: 52, oxygen: 4.8, ph: 8.1, turbidity: 43, note: "Still below safe oxygen range" }
    ]
  }
];

const activityFeed = [
  { time: "12 min", title: "Native fish index improved", detail: "Rishikesh station confirms a healthy morning oxygen pulse." },
  { time: "28 min", title: "Urban turbidity watch", detail: "Kanpur edge remains stable after a brief noon sediment lift." },
  { time: "44 min", title: "Confluence clarity gain", detail: "Prayagraj center channel moved back into safe recreational range." }
];

function statusLabel(status: SensorStation["status"]) {
  if (status === "safe") return "Safe";
  if (status === "watch") return "Watch";
  return "Unsafe";
}

function RiverChartTooltip({
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

  const tooltipWidth = 156;
  const tooltipHeight = 78;
  const position = getBoundedTooltipOffset({
    coordinate,
    viewBox,
    width: tooltipWidth,
    height: tooltipHeight,
    padding: 8,
    gap: 12
  });

  return (
    <div
      className={`river-tooltip ${position.edgeX} ${position.edgeY}`}
      style={{
        left: position.left,
        top: position.top
      }}
    >
      <span>{point.label}</span>
      <strong>WQI {point.wqi} · DO {point.oxygen} mg/L</strong>
      <p>{point.note}</p>
    </div>
  );
}

export function RiverHealthWorkspace() {
  const [activeId, setActiveId] = useState(stations[1].id);
  const activeStation = stations.find((station) => station.id === activeId) ?? stations[0];
  const safeCount = stations.filter((station) => station.status === "safe").length;

  const metrics = [
    { label: "Water Quality Index", value: activeStation.wqi, suffix: "/100", detail: statusLabel(activeStation.status) },
    { label: "Dissolved Oxygen", value: activeStation.oxygen, suffix: " mg/L", detail: activeStation.oxygen >= 6 ? "Ecology supportive" : "Low oxygen stress" },
    { label: "pH Stability", value: activeStation.ph, suffix: "", detail: Math.abs(activeStation.ph - 7.4) < 0.5 ? "Stable band" : "Needs review" },
    { label: "Safe Stretches", value: safeCount, suffix: `/${stations.length}`, detail: "Live sensor classification" }
  ];

  return (
    <div className="river-health-workspace">
      <section className="river-health-hero">
        <div className="river-hero-copy">
          <span className="river-eyebrow">River Health Intelligence</span>
          <h1>Calm, live water quality sensing across the Ganga corridor.</h1>
          <p>
            Tap a station to see how oxygen, pH, turbidity, safe stretches, and ecological recovery are moving together.
          </p>
        </div>
        <div className="river-hero-orb">
          <span>Live WQI</span>
          <strong>{activeStation.wqi}</strong>
          <p>{activeStation.name}</p>
        </div>
      </section>

      <section className="river-metrics-grid" aria-label="River health metrics">
        {metrics.map((metric) => (
          <article className="river-metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metric.value}
              <small>{metric.suffix}</small>
            </strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="river-map-panel">
        <div className="river-panel-head">
          <div>
            <span>Interactive river map</span>
            <h2>{activeStation.stretch}</h2>
          </div>
          <p>{activeStation.habitat}</p>
        </div>

        <RiverHealthMap
          activeStationId={activeStation.id}
          onStationSelect={setActiveId}
          stations={stations}
          statusLabel={statusLabel}
        />
      </section>

      <section className="river-telemetry-grid">
        <article className="river-chart-card">
          <div className="river-panel-head compact">
            <div>
              <span>Statistical telemetry</span>
              <h2>WQI and dissolved oxygen</h2>
            </div>
            <p>Station-linked trend with bounded hover detail.</p>
          </div>
          <div className="river-chart-shell">
            <ResponsiveContainer width="100%" height={218}>
              <LineChart data={activeStation.series} margin={{ top: 14, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(22, 85, 82, 0.08)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#65827b", fontSize: 11 }} />
                <YAxis yAxisId="wqi" axisLine={false} tickLine={false} tick={{ fill: "#65827b", fontSize: 11 }} width={44} />
                <YAxis yAxisId="oxygen" hide domain={[0, 10]} />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  content={<RiverChartTooltip />}
                  cursor={{ stroke: "rgba(18, 132, 145, 0.18)", strokeWidth: 2 }}
                  wrapperStyle={{ outline: "none", pointerEvents: "none", zIndex: 20, overflow: "visible" }}
                />
                <Line yAxisId="wqi" type="monotone" dataKey="wqi" stroke="#118a8f" strokeWidth={3} dot={{ r: 4, fill: "#118a8f", stroke: "#f7fffb", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                <Line yAxisId="oxygen" type="monotone" dataKey="oxygen" stroke="#52b788" strokeWidth={3} dot={{ r: 3, fill: "#52b788", stroke: "#f7fffb", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="river-chart-card">
          <div className="river-panel-head compact">
            <div>
              <span>Clarity and chemistry</span>
              <h2>pH stability vs turbidity</h2>
            </div>
            <p>A small signal view, not a telemetry wall.</p>
          </div>
          <div className="river-chart-shell">
            <ResponsiveContainer width="100%" height={218}>
              <AreaChart data={activeStation.series} margin={{ top: 14, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="turbidityFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1f9f99" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#1f9f99" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(22, 85, 82, 0.08)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#65827b", fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#65827b", fontSize: 11 }} width={44} />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  content={<RiverChartTooltip />}
                  cursor={{ stroke: "rgba(18, 132, 145, 0.18)", strokeWidth: 2 }}
                  wrapperStyle={{ outline: "none", pointerEvents: "none", zIndex: 20, overflow: "visible" }}
                />
                <Area type="monotone" dataKey="turbidity" stroke="#1f9f99" strokeWidth={3} fill="url(#turbidityFill)" />
                <Line type="monotone" dataKey="ph" stroke="#0f6f68" strokeWidth={3} dot={{ r: 4, fill: "#0f6f68", stroke: "#f7fffb", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="river-feed-panel">
        <div className="river-panel-head compact">
          <div>
            <span>Environmental activity</span>
            <h2>Recovery signals</h2>
          </div>
          <p>Compact basin context from recent station changes.</p>
        </div>
        <div className="river-feed-list">
          {activityFeed.map((item) => (
            <article className="river-feed-item" key={item.title}>
              <span>{item.time}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
