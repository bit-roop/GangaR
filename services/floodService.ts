import { floodMapData, floodRisks } from "@/data/mock";
import { normalizeFloodSeverity } from "@/lib/utils";
import type { FloodPanelData } from "@/types/dashboard";
import type { FloodRisk } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getFloodPanelData(): Promise<FloodPanelData> {
  const primary = floodRisks[0];
  const normalized = normalizeFloodSeverity(primary.riskLevel);

  return {
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
  };
}

export async function getFloodRisks(): Promise<ServiceResult<FloodRisk[]>> {
  return {
    data: floodRisks,
    lastUpdated: floodRisks[0].timestamp,
    source: "mock"
  };
}
