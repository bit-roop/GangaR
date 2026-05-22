import { ClientFloodMap } from "@/components/map/ClientFloodMap";
import { OperationalEmptyState } from "@/components/ui/OperationalState";
import { useOperationalContext } from "@/lib/state/useOperationalContext";
import { formatDischarge, formatPopulation, formatTimestamp } from "@/lib/utils";
import type { FloodPanelData } from "@/types/dashboard";

type FloodPredictionCardProps = {
  floodPanel: FloodPanelData;
};

export function FloodPredictionCard({ floodPanel }: FloodPredictionCardProps) {
  const { activeFloodPanel, activeDistrictName, activeContextLevel, districtIncidents } = useOperationalContext();
  const panel = activeFloodPanel ?? floodPanel;

  return (
    <article className="panel flood-panel">
      <div className="panel-head">
        <h4>Flood Prediction</h4>
        <span>{activeDistrictName} • {activeContextLevel}</span>
      </div>
      <div className="flood-layout">
        <div className="map-preview">
          {panel.map.markers.length || panel.map.zones.length ? (
            <ClientFloodMap data={panel.map} />
          ) : (
            <OperationalEmptyState
              compact
              title="Map data syncing"
              detail="Flood map layers are temporarily unavailable for this operational slice."
            />
          )}
        </div>
        <div className="risk-card">
          <div className="risk-header">
            <p>{panel.headline}</p>
            <span className="risk-confidence">{panel.confidence}% confidence</span>
          </div>
          <strong className="risk-summary">{panel.summary}</strong>
          <div className="risk-section">
            <span className="risk-section-label">Risk metrics</span>
            <div className="risk-metrics">
              <span>Rainfall forecast: {panel.rainfallForecastMm} mm</span>
              <span>Affected population: {formatPopulation(panel.affectedPopulationEstimate)}</span>
            </div>
          </div>
          <div className="risk-section">
            <span className="risk-section-label">Environmental metrics</span>
            <div className="risk-metrics">
              <span>River discharge: {formatDischarge(panel.riverDischargeCumecs)}</span>
              <span>Affected districts: {panel.affectedDistricts.join(", ")}</span>
            </div>
          </div>
          <div className="risk-section">
            <span className="risk-section-label">Operational metadata</span>
            <div className="risk-metrics">
              <span className="risk-source">{panel.sourceLabel}</span>
              <span className="risk-timestamp">Updated: {formatTimestamp(panel.timestamp)}</span>
              <span className="risk-sync">{panel.syncIndicator} • {panel.freshnessState}</span>
              <span className="risk-sync">Verified incidents in district: {districtIncidents.length}</span>
            </div>
          </div>
          <button>{panel.ctaLabel}</button>
        </div>
      </div>
    </article>
  );
}
