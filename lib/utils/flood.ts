import type { RiskLevel } from "@/types/environment";

export function normalizeFloodSeverity(riskLevel: RiskLevel) {
  if (riskLevel === "severe") {
    return { label: "Severe Risk", tone: "red" as const };
  }

  if (riskLevel === "moderate") {
    return { label: "Moderate Risk", tone: "amber" as const };
  }

  return { label: "Watch Zone", tone: "yellow" as const };
}

export function aggregateRainfall(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0);
}
