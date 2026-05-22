import { riverHealthMetrics } from "@/data/mock";
import { apiClient } from "@/lib/api/client";
import type { RiverHealthMetric } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getRiverHealthMetrics(): Promise<RiverHealthMetric[]> {
  return apiClient.get("/river/health", {
    mockData: riverHealthMetrics,
    mockLatencyMs: 600
  });
}

export async function getRiverHealthFeed(): Promise<ServiceResult<RiverHealthMetric[]>> {
  return apiClient.get("/river/health/feed", {
    mockData: {
      data: riverHealthMetrics,
      lastUpdated: riverHealthMetrics[0].updatedAt,
      source: "mock"
    },
    mockLatencyMs: 1200
  });
}
