"use client";

import { useEffect, useMemo, useState } from "react";

import { ClientBiodiversityMap } from "@/components/biodiversity/ClientBiodiversityMap";
import { OperationalEmptyState, OperationalSkeletonRows } from "@/components/ui/OperationalState";
import { getBiodiversityOperationsData } from "@/services/biodiversityOperationsService";
import type { BiodiversityOperationsData } from "@/types/biodiversity";

type BiodiversityWorkspaceProps = {
  initialData: BiodiversityOperationsData;
};

export function BiodiversityWorkspace({ initialData }: BiodiversityWorkspaceProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSpeciesId, setActiveSpeciesId] = useState(initialData.species[0]?.id ?? "");

  useEffect(() => {
    let active = true;

    void getBiodiversityOperationsData()
      .then((nextData) => {
        if (!active) return;
        setData(nextData);
        if (!activeSpeciesId && nextData.species[0]) {
          setActiveSpeciesId(nextData.species[0].id);
        }
        setIsRefreshing(false);
      })
      .catch(() => {
        if (!active) return;
        setError("The biodiversity intelligence feed is temporarily delayed. Showing the most recent synchronized view.");
        setIsRefreshing(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeSpecies = useMemo(
    () => data.species.find((species) => species.id === activeSpeciesId) ?? data.species[0],
    [activeSpeciesId, data.species]
  );

  const filteredFeed = useMemo(
    () =>
      activeSpecies
        ? data.observationFeed.filter((item) => !item.speciesId || item.speciesId === activeSpecies.id)
        : data.observationFeed,
    [activeSpecies, data.observationFeed]
  );

  return (
    <section className="biodiversity-workspace">
      <section className="biodiversity-hero">
        <div className="biodiversity-hero-copy">
          <span className="biodiversity-eyebrow">{data.hero.eyebrow}</span>
          <h1>{data.hero.title}</h1>
          <p>{data.hero.summary}</p>
          <div className="biodiversity-badge-row">
            {data.hero.badges.map((badge) => (
              <span key={badge} className="biodiversity-badge">
                {badge}
              </span>
            ))}
          </div>
        </div>
        <div className="biodiversity-hero-status">
          <span>Ecosystem status</span>
          <strong>{data.hero.status}</strong>
          <p>{data.hero.pulse}</p>
          <div className="biodiversity-live-indicator">
            <i />
            {isRefreshing ? "Refreshing habitat intelligence..." : "Live ecological picture"}
          </div>
        </div>
      </section>

      <section className="biodiversity-metrics-grid">
        {data.metrics.map((metric) => (
          <article key={metric.label} className={`biodiversity-metric-card tone-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <em>{metric.delta}</em>
            <p>{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="biodiversity-main-grid">
        <article className="biodiversity-panel biodiversity-map-panel">
          <div className="biodiversity-panel-head">
            <div>
              <span>Live ecosystem surface</span>
              <h3>Ecosystem map</h3>
            </div>
            <p>Habitats, movement paths, species markers, and pressure zones.</p>
          </div>
          <ClientBiodiversityMap data={data.map} activeSpeciesId={activeSpecies?.id ?? ""} />
        </article>

        <aside className="biodiversity-side-stack">
          <article className="biodiversity-panel biodiversity-feed-panel">
            <div className="biodiversity-panel-head">
              <div>
                <span>Observation stream</span>
                <h3>Species activity feed</h3>
              </div>
            </div>
            {error ? <div className="inline-operational-error">{error}</div> : null}
            {isRefreshing ? (
              <OperationalSkeletonRows rows={3} compact />
            ) : filteredFeed.length ? (
              <div className="biodiversity-feed-list">
                {filteredFeed.map((item) => (
                  <button key={item.id} type="button" className="biodiversity-feed-item">
                    <div className="biodiversity-feed-item-top">
                      <strong>{item.title}</strong>
                      <span>{item.tag}</span>
                    </div>
                    <p>{item.summary}</p>
                    <div className="biodiversity-feed-meta">
                      <span>{item.district}</span>
                      <span>{item.confidence}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <OperationalEmptyState
                compact
                title="No observations in the selected filter"
                detail="Switch to another species card to inspect recent field and telemetry activity."
              />
            )}
          </article>

          <article className="biodiversity-panel biodiversity-risk-panel">
            <div className="biodiversity-panel-head">
              <div>
                <span>Conservation signals</span>
                <h3>Habitat pressure</h3>
              </div>
            </div>
            <div className="biodiversity-risk-grid">
              {data.conservationPanels.map((panel) => (
                <div key={panel.id} className={`biodiversity-risk-card severity-${panel.severity}`}>
                  <span>{panel.title}</span>
                  <strong>{panel.indicator}</strong>
                  <p>{panel.note}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="biodiversity-lower-grid">
        <article className="biodiversity-panel">
          <div className="biodiversity-panel-head">
            <div>
              <span>Species monitoring</span>
              <h3>Focal species</h3>
            </div>
            <p>Select a species to refocus the map and feed.</p>
          </div>
          <div className="biodiversity-species-grid">
            {data.species.map((species) => (
              <button
                key={species.id}
                type="button"
                className={`biodiversity-species-card ${activeSpecies?.id === species.id ? "active" : ""}`}
                onClick={() => setActiveSpeciesId(species.id)}
              >
                <div className="biodiversity-species-image" style={species.image ? { backgroundImage: `url(${species.image})` } : undefined}>
                  <span style={{ backgroundColor: species.markerColor }}>{species.conservationStatus}</span>
                </div>
                <div className="biodiversity-species-copy">
                  <strong>{species.speciesName}</strong>
                  <em>{species.scientificName}</em>
                  <p>{species.activityState}</p>
                </div>
                <dl className="biodiversity-species-meta">
                  <div>
                    <dt>Last seen</dt>
                    <dd>{species.lastObservation}</dd>
                  </div>
                  <div>
                    <dt>Habitat</dt>
                    <dd>{species.habitatZone}</dd>
                  </div>
                  <div>
                    <dt>Signal</dt>
                    <dd>{species.habitatNotes}</dd>
                  </div>
                </dl>
              </button>
            ))}
          </div>
        </article>

        <div className="biodiversity-lower-stack">
          <article className="biodiversity-panel">
            <div className="biodiversity-panel-head">
              <div>
                <span>Habitat monitoring</span>
                <h3>Habitat condition</h3>
              </div>
            </div>
            <div className="biodiversity-habitat-grid">
              {data.habitats.map((habitat) => (
                <article key={habitat.id} className="biodiversity-habitat-card">
                  <div className="biodiversity-habitat-top">
                    <div>
                      <strong>{habitat.habitatName}</strong>
                      <span>{habitat.habitatType}</span>
                    </div>
                    <em>{habitat.condition}</em>
                  </div>
                  <p>{habitat.note}</p>
                  <div className="biodiversity-habitat-meta">
                    <span>{habitat.district}</span>
                    <span>{habitat.telemetry}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="biodiversity-panel biodiversity-timeline-panel">
            <div className="biodiversity-panel-head">
              <div>
                <span>Migration and activity</span>
                <h3>Movement timeline</h3>
              </div>
            </div>
            <div className="biodiversity-migration-list">
              {data.migrationTimeline.map((event) => (
                <article key={event.id} className={`biodiversity-migration-item intensity-${event.intensity}`}>
                  <div className="biodiversity-migration-dot" />
                  <div>
                    <strong>{event.title}</strong>
                    <p>{event.detail}</p>
                    <div className="biodiversity-migration-meta">
                      <span>{event.district}</span>
                      <span>{event.window}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
