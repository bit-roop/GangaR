"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { FloodChartPoint } from "@/types/flood";

type ForecastChartCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  data: FloodChartPoint[];
  variant: "bar" | "line";
  color: string;
  valueFormatter?: (point: FloodChartPoint) => string;
};

type TooltipPayloadItem = {
  payload: FloodChartPoint;
};

function ForecastTooltip({
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

  const x = coordinate?.x ?? 0;
  const y = coordinate?.y ?? 0;
  const viewX = viewBox?.x ?? 0;
  const viewY = viewBox?.y ?? 0;
  const width = viewBox?.width ?? 0;
  const height = viewBox?.height ?? 0;
  const tooltipWidth = 132;
  const tooltipHeight = 62;
  const sideOffset = 12;
  const verticalOffset = 10;
  const rightSpace = viewX + width - x;
  const leftSpace = x - viewX;
  const bottomSpace = viewY + height - y;
  const topSpace = y - viewY;

  const openLeft = rightSpace < tooltipWidth + sideOffset && leftSpace > rightSpace;
  const openRight = !openLeft;
  const openDown = topSpace < tooltipHeight + verticalOffset && bottomSpace > topSpace;
  const openUp = !openDown;

  return (
    <div
      className={`flood-chart-tooltip ${openLeft ? "edge-left" : "edge-right"} ${openDown ? "edge-down" : "edge-up"}`}
      style={{
        left: openRight ? sideOffset : -tooltipWidth - sideOffset,
        top: openDown ? verticalOffset : -tooltipHeight - verticalOffset
      }}
    >
      <i className="flood-chart-tooltip-arrow" />
      <span>{point.label}</span>
      <strong>
        {point.value}
        {point.unit}
      </strong>
      <p>{point.interpretation}</p>
    </div>
  );
}

export function ForecastChartCard({
  eyebrow,
  title,
  description,
  data,
  variant,
  color,
  valueFormatter
}: ForecastChartCardProps) {
  const formatTick = (value: number) => `${value}${data[0]?.unit ?? ""}`;

  return (
    <article className="flood-panel flood-chart-panel">
      <div className="flood-panel-head">
        <div>
          <span>{eyebrow}</span>
          <h3>{title}</h3>
        </div>
        <p>{description}</p>
      </div>

      <div className="flood-chart-shell">
        <ResponsiveContainer width="100%" height={260}>
          {variant === "bar" ? (
            <BarChart data={data} margin={{ top: 14, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(16, 33, 28, 0.06)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#62756e", fontSize: 11 }} />
              <YAxis
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#62756e", fontSize: 11 }}
                width={42}
              />
              <Tooltip
                cursor={{ fill: "rgba(121, 217, 255, 0.06)" }}
                content={<ForecastTooltip />}
                offset={14}
                wrapperStyle={{ outline: "none", pointerEvents: "none", zIndex: 40, overflow: "visible" }}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              <Bar dataKey="value" radius={[12, 12, 8, 8]} animationDuration={900}>
                {data.map((point, index) => (
                  <Cell
                    key={point.label}
                    fill={index === 2 ? "#2ca7d0" : color}
                    fillOpacity={index === 2 ? 1 : 0.82}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 18, right: 16, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(16, 33, 28, 0.06)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#62756e", fontSize: 11 }} />
              <YAxis
                tickFormatter={formatTick}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#62756e", fontSize: 11 }}
                width={42}
              />
              <Tooltip
                content={<ForecastTooltip />}
                offset={14}
                wrapperStyle={{ outline: "none", pointerEvents: "none", zIndex: 40, overflow: "visible" }}
                allowEscapeViewBox={{ x: true, y: true }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ r: 4, fill: color, stroke: "#f8fbf9", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: color, stroke: "#ffffff", strokeWidth: 2 }}
                animationDuration={950}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flood-chart-foot">
        <strong>{valueFormatter ? valueFormatter(data[data.length - 1] ?? data[0]) : data[data.length - 1]?.interpretation}</strong>
        <span>{data.find((point) => point.confidence)?.confidence ? `${data.find((point) => point.confidence)?.confidence}% forecast confidence` : data[0]?.comparison}</span>
      </div>
    </article>
  );
}
