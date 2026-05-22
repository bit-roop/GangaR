import { environmentalAlerts } from "@/data/mock";
import { apiClient } from "@/lib/api/client";
import type { EnvironmentalAlert } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getEnvironmentalAlerts(): Promise<EnvironmentalAlert[]> {
  return apiClient.get("/alerts/active", {
    mockData: environmentalAlerts,
    mockLatencyMs: 600
  });
}

export async function getEnvironmentalAlertsFeed(): Promise<ServiceResult<EnvironmentalAlert[]>> {
  return apiClient.get("/alerts/feed", {
    mockData: {
      data: environmentalAlerts,
      lastUpdated: environmentalAlerts[0].timestamp,
      source: "mock"
    },
    mockLatencyMs: 1200
  });
}
