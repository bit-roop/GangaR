import { floodMapData, floodRisks } from "@/data/mock";
import { apiClient } from "@/lib/api/client";
import { normalizeFloodSeverity } from "@/lib/utils";
import type { FloodPanelData } from "@/types/dashboard";
import type { FloodRisk } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getFloodPanelData(): Promise<FloodPanelData> {
  const primary = floodRisks[0];
  const normalized = normalizeFloodSeverity(primary.riskLevel);

  return apiClient.get("/flood/panel", {
    mockData: {
      headline: normalized.label,
      confidence: primary.confidence,
      summary: primary.summary,
      ctaLabel: "See Details",
      sourceLabel: primary.sourceLabel,
      timestamp: primary.timestamp,
      affectedDistricts: floodRisks.map((item) => item.district),
      rainfallForecastMm: primary.rainfallForecastMm,
      riverDischargeCumecs: primary.riverDischargeCumecs,
      affectedPopulationEstimate: primary.affectedPopulationEstimate,
      freshnessState: "Feed synced 6 min ago",
      syncIndicator: "Live basin monitoring",
      map: floodMapData
    },
    mockLatencyMs: 1200
  });
}

export async function getFloodRisks(): Promise<ServiceResult<FloodRisk[]>> {
  return apiClient.get("/flood/risks", {
    mockData: {
      data: floodRisks,
      lastUpdated: floodRisks[0].timestamp,
      source: "mock"
    },
    mockLatencyMs: 600
  });
}
