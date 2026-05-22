import { biodiversityOperationsData } from "@/data/mock";
import { apiClient } from "@/lib/api/client";
import type { BiodiversityOperationsData } from "@/types/biodiversity";

export async function getBiodiversityOperationsData(): Promise<BiodiversityOperationsData> {
  return apiClient.get("/biodiversity/operations", {
    mockData: biodiversityOperationsData,
    mockLatencyMs: 1200
  });
}
