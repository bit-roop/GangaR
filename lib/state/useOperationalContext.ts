"use client";

import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/shallow";

import { useDashboardData } from "@/components/dashboard/DashboardDataProvider";
import { useOperationalStore } from "@/lib/state/useOperationalStore";
import { formatOperationalTime, normalizeFloodSeverity } from "@/lib/utils";

export function useOperationalContext() {
  const data = useDashboardData();
  const selection = useOperationalStore(
    useShallow((state) => ({
      selectedDistrict: state.selectedDistrict,
      selectedFloodZone: state.selectedFloodZone,
      selectedBiodiversityEntity: state.selectedBiodiversityEntity,
      selectedMapMarker: state.selectedMapMarker,
      timelineFilter: state.timelineFilter,
      activeContextLevel: state.activeContextLevel,
      isDrawerOpen: state.isDrawerOpen,
      incidentReports: state.incidentReports,
      incidentFilters: state.incidentFilters,
      activeRole: state.activeRole,
      submissionCooldownUntil: state.submissionCooldownUntil,
      lastInteractionSource: state.lastInteractionSource
    }))
  );

  const derived = useMemo(() => {
    const activeDistrictName = selection.selectedDistrict ?? data.districtIntelligence[0]?.district ?? "Patna";
    const activeDistrict = data.districtIntelligence.find((item) => item.district === activeDistrictName) ?? data.districtIntelligence[0];
    const activeFloodRisk =
      data.floodRisks.find((item) => item.district === activeDistrictName) ?? data.floodRisks[0];
    const operationalIncidents = selection.incidentReports.filter(
      (incident) => incident.verificationStatus === "Verified" || incident.verificationStatus === "Escalated"
    );
    const communityReports = selection.incidentReports.filter(
      (incident) =>
        incident.verificationStatus === "Pending Verification" ||
        incident.verificationStatus === "Under Analyst Review" ||
        incident.verificationStatus === "Rejected"
    );
    const districtIncidents = operationalIncidents.filter((incident) => incident.district === activeDistrictName);
    const activeFloodZone =
      data.floodPanel.map.zones.find((zone) => zone.id === selection.selectedFloodZone) ??
      data.floodPanel.map.zones.find((zone) => zone.district === activeDistrictName) ??
      null;
    const activeMarker =
      data.floodPanel.map.markers.find((marker) => marker.id === selection.selectedMapMarker) ??
      data.floodPanel.map.markers.find((marker) => marker.district === activeDistrictName) ??
      null;
    const activeBiodiversity =
      data.biodiversity.find((item) => item.name === selection.selectedBiodiversityEntity) ??
      data.biodiversity.find((item) => item.districtTag === activeDistrictName) ??
      null;
    const filteredIncidents = selection.incidentReports.filter((incident) => {
      const districtMatch =
        selection.incidentFilters.district === "All" || incident.district === selection.incidentFilters.district;
      const severityMatch =
        selection.incidentFilters.severity === "All" ||
        (incident.analystSeverity ?? incident.severity) === selection.incidentFilters.severity;
      const categoryMatch =
        selection.incidentFilters.category === "All" || incident.category === selection.incidentFilters.category;
      const statusMatch =
        selection.incidentFilters.status === "All" || incident.status === selection.incidentFilters.status;
      const verificationMatch =
        selection.incidentFilters.verificationStatus === "All" ||
        incident.verificationStatus === selection.incidentFilters.verificationStatus;

      return districtMatch && severityMatch && categoryMatch && statusMatch && verificationMatch;
    });

    const activeTimelineContext =
      selection.activeContextLevel === "floodZone"
        ? "flood"
        : selection.activeContextLevel === "biodiversity"
          ? "biodiversity"
          : selection.activeContextLevel === "marker" && activeMarker?.category === "biodiversity"
            ? "biodiversity"
            : selection.activeContextLevel === "marker"
              ? "flood"
              : selection.timelineFilter;

    const filteredTimeline = data.operationalTimeline.filter((event) => {
      const districtMatch = event.district === activeDistrictName;
      if (activeTimelineContext === "all") return districtMatch;
      if (activeTimelineContext === "flood") return districtMatch && (event.category === "flood" || event.category === "rainfall");
      if (activeTimelineContext === "biodiversity") return districtMatch && event.category === "biodiversity";
      if (activeTimelineContext === "sewage") return districtMatch && event.category === "pollution";
      if (activeTimelineContext === "district") return districtMatch;
      return districtMatch;
    });
    const incidentTimeline = operationalIncidents
      .filter((incident) => incident.district === activeDistrictName)
      .map((incident) => ({
        id: `incident-timeline-${incident.id}`,
        title: incident.title,
        category: "incident" as const,
        district: incident.district,
        timestamp: formatOperationalTime(incident.reportedAt),
        detail: incident.description,
        status:
          incident.status === "Reported"
            ? "Logged"
            : incident.status === "Resolved"
              ? "Logged"
              : "Monitoring"
      }));

    const normalizedRisk = normalizeFloodSeverity(activeFloodRisk.riskLevel);
    const enrichedDistrict = {
      ...activeDistrict,
      activeAlerts: [
        ...activeDistrict.activeAlerts,
        ...districtIncidents.slice(0, 2).map((incident) => `${incident.category} • ${incident.status}`)
      ].slice(0, 4),
      lastUpdated: districtIncidents[0]?.updatedAt ?? activeDistrict.lastUpdated
    };
    const activeFloodPanel = {
      ...data.floodPanel,
      headline: normalizedRisk.label,
      confidence: activeFloodZone?.confidence ?? activeFloodRisk.confidence,
      summary: activeFloodRisk.summary,
      sourceLabel: activeFloodRisk.sourceLabel,
      timestamp: activeFloodZone?.updatedAt ?? activeFloodRisk.timestamp,
      affectedDistricts: [activeFloodRisk.district],
      rainfallForecastMm: activeFloodRisk.rainfallForecastMm,
      riverDischargeCumecs: activeFloodRisk.riverDischargeCumecs,
      affectedPopulationEstimate: activeFloodRisk.affectedPopulationEstimate,
      freshnessState: activeDistrict.delayedFeed ? "Delayed district feed" : data.floodPanel.freshnessState,
      syncIndicator: activeDistrict.delayedFeed ? "Partial telemetry sync" : data.floodPanel.syncIndicator
    };

    return {
      activeDistrictName,
      activeDistrict: enrichedDistrict,
      activeFloodRisk,
      activeFloodZone,
      activeMarker,
      activeBiodiversity,
      districtIncidents,
      communityReports,
      operationalIncidents,
      activeTimelineContext,
      filteredIncidents,
      filteredTimeline: [...incidentTimeline, ...filteredTimeline],
      activeFloodPanel
    };
  }, [data, selection]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    console.debug("[operational-context]", {
      district: derived.activeDistrictName,
      floodZone: derived.activeFloodZone?.id ?? null,
      marker: derived.activeMarker?.id ?? null,
      biodiversity: derived.activeBiodiversity?.name ?? null,
      contextLevel: selection.activeContextLevel,
      timelineFilter: selection.timelineFilter,
      activeTimelineContext: derived.activeTimelineContext,
      incidentCount: derived.filteredIncidents.length,
      role: selection.activeRole,
      timelineCount: derived.filteredTimeline.length,
      drawerOpen: selection.isDrawerOpen,
      source: selection.lastInteractionSource
    });
  }, [derived, selection]);

  return {
    data,
    selection,
    activeContextLevel: selection.activeContextLevel,
    activeRole: selection.activeRole,
    submissionCooldownUntil: selection.submissionCooldownUntil,
    ...derived
  };
}
