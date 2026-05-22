import { floodOperationsData } from "@/data/mock/floodOperations";
import { apiClient } from "@/lib/api/client";
import type { FloodOperationsData } from "@/types/flood";

export async function getFloodOperationsData(): Promise<FloodOperationsData> {
  return apiClient.get("/flood/operations", {
    mockData: floodOperationsData,
    mockLatencyMs: 1200
  });
}
