"use client";

import { useEffect, useMemo, useState } from "react";

import { DashboardDataProvider } from "@/components/dashboard/DashboardDataProvider";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { BiodiversityCard } from "@/components/cards/BiodiversityCard";
import { FloodPredictionCard } from "@/components/cards/FloodPredictionCard";
import { StatCard } from "@/components/cards/StatCard";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { DistrictDrawer } from "@/components/dashboard/DistrictDrawer";
import { AnalystIncidentPanel } from "@/components/incidents/AnalystIncidentPanel";
import { IncidentReportDrawer } from "@/components/incidents/IncidentReportDrawer";
import { OperationalReportAction } from "@/components/incidents/OperationalReportAction";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { OperationalTimeline } from "@/components/alerts/OperationalTimeline";
import { OperationalEmptyState } from "@/components/ui/OperationalState";
import { getIncidentReports } from "@/services/incidentService";
import type { DashboardData } from "@/types/dashboard";

type DashboardInteractiveShellProps = {
  data: DashboardData;
  embedded?: boolean;
};

function DashboardContent({
  data,
  onSpeciesSelect
}: {
  data: DashboardData;
  onSpeciesSelect: (speciesName: string) => void;
}) {
  return (
    <>
      <HeroBanner title={data.heroTitle} image={data.heroImage} thought={data.thought} />

      <section className="stats-grid">
        {data.stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="lower-grid">
        <div className="dashboard-left-stack">
          <article className="panel">
            <div className="panel-head">
              <h4>Biodiversity Highlights</h4>
              <span>View All</span>
            </div>
            <div className="species-grid">
              {!data.biodiversity.length ? (
                <OperationalEmptyState
                  compact
                  title="No biodiversity observations"
                  detail="No recent habitat or species observations are available in the current monitoring window."
                />
              ) : null}
              {data.biodiversity.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="species-trigger"
                  onClick={() => onSpeciesSelect(item.name)}
                >
                  <BiodiversityCard item={item} />
                </button>
              ))}
            </div>
            <div className="bio-insight-strip">
              {data.biodiversityInsights.map((insight) => (
                <div key={insight.label} className="bio-insight-card">
                  <span className={`bio-insight-label ${insight.tone ?? ""}`}>{insight.label}</span>
                  <strong>{insight.value}</strong>
                  <p>{insight.note}</p>
                </div>
              ))}
            </div>
          </article>

          <OperationalTimeline events={data.operationalTimeline} />
        </div>
        <FloodPredictionCard floodPanel={data.floodPanel} />
      </section>
    </>
  );
}

export function DashboardInteractiveShell({ data, embedded = false }: DashboardInteractiveShellProps) {
  const [hasHydratedIncidentFeed, setHasHydratedIncidentFeed] = useState(false);
  const selectBiodiversityEntity = useOperationalStore((state) => state.selectBiodiversityEntity);
  const incidentReports = useOperationalStore((state) => state.incidentReports);
  const setIncidentReports = useOperationalStore((state) => state.setIncidentReports);
  const openIncidentDrawer = useOperationalStore((state) => state.openIncidentDrawer);
  const selectedDistrict = useOperationalStore((state) => state.selectedDistrict);
  const isIncidentReviewPanelOpen = useOperationalStore((state) => state.isIncidentReviewPanelOpen);
  const closeIncidentReviewPanel = useOperationalStore((state) => state.closeIncidentReviewPanel);

  useEffect(() => {
    if (!incidentReports.length && data.incidents.length) {
      setIncidentReports(data.incidents);
    }
  }, [data.incidents, incidentReports.length, setIncidentReports]);

  useEffect(() => {
    let active = true;

    void getIncidentReports()
      .then((reports) => {
        if (!active) return;
        setIncidentReports(reports);
        setHasHydratedIncidentFeed(true);
      })
      .catch(() => {
        if (!active) return;
        setHasHydratedIncidentFeed(true);
      });

    return () => {
      active = false;
    };
  }, [setIncidentReports]);

  const districtFromSpecies = useMemo(
    () => Object.fromEntries(data.biodiversity.map((item) => [item.name, item.districtTag])),
    [data.biodiversity]
  );
  const handleSpeciesSelect = (speciesName: string) => {
    const district = districtFromSpecies[speciesName] ?? "Patna";
    selectBiodiversityEntity(speciesName, district, "biodiversity");
  };

  if (embedded) {
    return (
      <>
        <DashboardContent data={data} onSpeciesSelect={handleSpeciesSelect} />
        <OperationalReportAction onOpen={() => openIncidentDrawer(selectedDistrict)} />
        <IncidentReportDrawer hasHydratedIncidentFeed={hasHydratedIncidentFeed} />
        <AnalystIncidentPanel
          embedded
          isOpen={isIncidentReviewPanelOpen}
          onClose={closeIncidentReviewPanel}
          initialReports={data.incidents}
        />
        <DistrictDrawer />
      </>
    );
  }

  return (
    <DashboardDataProvider data={data}>
      <main className="page-shell page-shell-interactive">
        <section className="desktop-frame">
          <Sidebar items={data.sidebarItems} />

          <div className="desktop-content">
            <Topbar
              location={data.location}
              greeting={data.greeting}
              subcopy={data.subcopy}
              weather={data.weather}
            />

            <DashboardContent data={data} onSpeciesSelect={handleSpeciesSelect} />
          </div>
        </section>

        <MobileDashboard data={data} />
        <OperationalReportAction onOpen={() => openIncidentDrawer(selectedDistrict)} />
        <IncidentReportDrawer hasHydratedIncidentFeed={hasHydratedIncidentFeed} />
        <AnalystIncidentPanel
          embedded
          isOpen={isIncidentReviewPanelOpen}
          onClose={closeIncidentReviewPanel}
          initialReports={data.incidents}
        />
        <DistrictDrawer />
      </main>
    </DashboardDataProvider>
  );
}
