import { environmentalAlerts } from "@/data/mock";
import type { EnvironmentalAlert } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getEnvironmentalAlerts(): Promise<EnvironmentalAlert[]> {
  return environmentalAlerts;
}

export async function getEnvironmentalAlertsFeed(): Promise<ServiceResult<EnvironmentalAlert[]>> {
  return {
    data: environmentalAlerts,
    lastUpdated: environmentalAlerts[0].timestamp,
    source: "mock"
  };
}
