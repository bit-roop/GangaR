"use client";

import { useEffect, useState } from "react";

import { ForecastChartCard } from "@/components/flood/FloodForecastCharts";
import { ClientFloodOperationsMap } from "@/components/flood/ClientFloodOperationsMap";
import { getFloodOperationsData } from "@/services/floodOperationsService";
import type { FloodOperationsData } from "@/types/flood";

type FloodWorkspaceProps = {
  initialData: FloodOperationsData;
};

export function FloodWorkspace({ initialData }: FloodWorkspaceProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void getFloodOperationsData()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        setIsRefreshing(false);
      })
      .catch(() => {
        if (!active) return;
        setError("The flood intelligence feed is momentarily delayed. Showing the latest synchronized forecasting surface.");
        setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="flood-workspace">
      <section className="flood-hero">
        <div className="flood-hero-copy">
          <span className="flood-eyebrow">{data.hero.eyebrow}</span>
          <h1>{data.hero.title}</h1>
          <p>{data.hero.summary}</p>
          <div className="flood-badge-row">
            {data.hero.badges.map((badge) => (
              <span key={badge} className="flood-badge">{badge}</span>
            ))}
          </div>
          <button type="button" className="flood-hero-action">
            {data.hero.actionLabel}
          </button>
        </div>
        <div className="flood-hero-status">
          <span>Current status</span>
          <strong>{data.hero.status}</strong>
          <p>{data.hero.pulse}</p>
          <div className="flood-live-indicator">
            <i />
            {isRefreshing ? "Refreshing forecast..." : "Live flood update"}
          </div>
        </div>
      </section>

      <section className="flood-forecast-grid">
        <ForecastChartCard
          eyebrow="Rainfall forecast"
          title="Next 12 hours"
          description="Expected rainfall through the day."
          data={data.rainfallForecast}
          variant="bar"
          color="#7acff0"
          valueFormatter={(point) => point.interpretation}
        />
        <ForecastChartCard
          eyebrow="Flood risk"
          title="Probability trend"
          description="How risk changes through the day."
          data={data.floodProbability}
          variant="line"
          color="#2ca7d0"
          valueFormatter={(point) => point.interpretation}
        />
        <ForecastChartCard
          eyebrow="River level"
          title="5-day trend"
          description="A simple view of the recent rise."
          data={data.riverTrend}
          variant="line"
          color="#5cb697"
          valueFormatter={(point) => point.interpretation}
        />
      </section>

      <section className="flood-metrics-grid">
        {data.metrics.map((metric) => (
          <article key={metric.label} className={`flood-metric-card tone-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.delta}</em>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="flood-district-watch">
        <article className="flood-panel flood-district-panel">
          <div className="flood-panel-head">
            <div>
              <span>District watch</span>
              <h3>At-risk areas</h3>
            </div>
            <p>Simple district warnings and local forecast signals.</p>
          </div>
          <div className="flood-district-grid">
            {data.districtCards.map((district) => (
              <article key={district.id} className={`flood-district-card risk-${district.risk}`}>
                <div className="flood-district-top">
                  <strong>{district.district}</strong>
                  <span>{district.risk}</span>
                </div>
                <p>{district.summary}</p>
                <div className="flood-district-meta">
                  <span>{district.rainfall}</span>
                  <span>{district.riverSignal}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="flood-map-section">
        <article className="flood-panel flood-map-panel flood-map-panel-secondary">
          <div className="flood-panel-head">
            <div>
              <span>Flood map</span>
              <h3>Map view</h3>
            </div>
            <p>Use the map to explore where rainfall and flood spread may shift next.</p>
          </div>
          <ClientFloodOperationsMap data={data.map} />
        </article>
      </section>
    </section>
  );
}
