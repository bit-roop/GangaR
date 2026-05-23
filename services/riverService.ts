import { riverHealthMetrics } from "@/data/mock";
import type { RiverHealthMetric } from "@/types/environment";
import type { ServiceResult } from "@/types/service";

export async function getRiverHealthMetrics(): Promise<RiverHealthMetric[]> {
  return riverHealthMetrics;
}

export async function getRiverHealthFeed(): Promise<ServiceResult<RiverHealthMetric[]>> {
  return {
    data: riverHealthMetrics,
    lastUpdated: riverHealthMetrics[0].updatedAt,
    source: "mock"
  };
}
